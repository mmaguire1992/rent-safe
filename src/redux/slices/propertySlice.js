import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllProperties,
  getPropertyById,
  getMyProperties,
  getMyActiveProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '@/api/properties';

const initialState = {
  properties: [],
  myProperties: [],
  myActiveProperties: [],
  selectedProperty: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAllProperties(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyProperties = createAsyncThunk(
  'property/fetchMyProperties',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getMyProperties(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyActiveProperties = createAsyncThunk(
  'property/fetchMyActiveProperties',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getMyActiveProperties(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'property/fetchPropertyById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getPropertyById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createNewProperty = createAsyncThunk(
  'property/createProperty',
  async (propertyData, { rejectWithValue }) => {
    try {
      const response = await createProperty(propertyData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateExistingProperty = createAsyncThunk(
  'property/updateProperty',
  async ({ id, propertyData }, { rejectWithValue }) => {
    try {
      const response = await updateProperty(id, propertyData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteExistingProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id, { rejectWithValue }) => {
    try {
      await deleteProperty(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    },
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        // Handle different response structures
        let properties = [];
        let paginationData = {};
        
        if (response?.data) {
          // If response has data property
          if (Array.isArray(response.data)) {
            properties = response.data;
          } else if (response.data.properties) {
            properties = response.data.properties;
            paginationData = {
              total: response.data.count || response.data.total || 0,
              count: response.data.count || response.data.total || 0,
              page: response.data.page || 1,
              limit: response.data.limit || 10,
              totalPages: response.data.totalPages || 1,
            };
          }
        } else if (Array.isArray(response)) {
          properties = response;
        } else if (response?.properties) {
          properties = response.properties;
          paginationData = {
            total: response.count || response.total || 0,
            count: response.count || response.total || 0,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
          };
        }
        
        state.properties = properties;
        if (Object.keys(paginationData).length > 0) {
          state.pagination = {
            ...state.pagination,
            ...paginationData,
          };
        }
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Properties
      .addCase(fetchMyProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProperties.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        
        // Handle different response structures
        let properties = [];
        let paginationData = {};
        
        // The API function returns { properties, total, page, limit, totalPages }
        if (response?.properties) {
          properties = Array.isArray(response.properties) ? response.properties : [];
          paginationData = {
            total: response.total || response.count || 0,
            count: response.total || response.count || 0,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
          };
        } else if (response?.data) {
          // If response has data property (raw API response)
          if (response.data.properties) {
            properties = Array.isArray(response.data.properties) ? response.data.properties : [];
            paginationData = {
              total: response.data.count || response.data.total || 0,
              count: response.data.count || response.data.total || 0,
              page: response.data.page || 1,
              limit: response.data.limit || 10,
              totalPages: response.data.totalPages || 1,
            };
          } else if (Array.isArray(response.data)) {
            properties = response.data;
          }
        } else if (Array.isArray(response)) {
          properties = response;
        }
        
        state.myProperties = properties;
        if (Object.keys(paginationData).length > 0) {
          state.pagination = {
            ...state.pagination,
            ...paginationData,
          };
        }
      })
      .addCase(fetchMyProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Active Properties
      .addCase(fetchMyActiveProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyActiveProperties.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        state.myActiveProperties = Array.isArray(data) ? data : (data?.properties || []);
        if (data?.pagination) {
          state.pagination = data.pagination;
        }
      })
      .addCase(fetchMyActiveProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Property By ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProperty = action.payload?.data || action.payload?.property || action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Property
      .addCase(createNewProperty.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createNewProperty.fulfilled, (state, action) => {
        state.creating = false;
        const newProperty = action.payload?.data || action.payload?.property || action.payload;
        if (newProperty) {
          state.myProperties.unshift(newProperty);
        }
      })
      .addCase(createNewProperty.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Update Property
      .addCase(updateExistingProperty.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateExistingProperty.fulfilled, (state, action) => {
        state.updating = false;
        const updatedProperty = action.payload?.data || action.payload?.property || action.payload;
        if (updatedProperty) {
          const index = state.myProperties.findIndex(p => p._id === updatedProperty._id);
          if (index !== -1) {
            state.myProperties[index] = updatedProperty;
          }
          if (state.selectedProperty?._id === updatedProperty._id) {
            state.selectedProperty = updatedProperty;
          }
        }
      })
      .addCase(updateExistingProperty.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Delete Property
      .addCase(deleteExistingProperty.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteExistingProperty.fulfilled, (state, action) => {
        state.deleting = false;
        state.myProperties = state.myProperties.filter(p => p._id !== action.payload);
        if (state.selectedProperty?._id === action.payload) {
          state.selectedProperty = null;
        }
      })
      .addCase(deleteExistingProperty.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedProperty, setSelectedProperty } = propertySlice.actions;
export default propertySlice.reducer;

