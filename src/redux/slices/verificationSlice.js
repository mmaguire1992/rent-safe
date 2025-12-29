import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getMyDocuments,
  uploadDocumentsToS3,
  storeDocuments,
} from '@/api/verification';

const initialState = {
  documents: null, // Full documents data from API
  documentsByType: {
    identity_proof: [],
    id_proof: [],
    pay_slip: [],
    bank_statement: [],
    property_papers: [],
    licenses: [],
  },
  verificationStatus: 'not_started', // not_started, pending, verified, rejected
  loading: false,
  uploading: false,
  storing: false,
  error: null,
};

// Async thunk to fetch user's documents
export const fetchMyDocuments = createAsyncThunk(
  'verification/fetchMyDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getMyDocuments();
      return result;
    } catch (error) {
      // API returns { success: false, error: "message" } or { success: false, message: "message" }
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch documents';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to upload documents to S3
export const uploadDocuments = createAsyncThunk(
  'verification/uploadDocuments',
  async (formData, { rejectWithValue }) => {
    try {
      const result = await uploadDocumentsToS3(formData);
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to upload documents';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to store document metadata
export const storeDocumentMetadata = createAsyncThunk(
  'verification/storeDocumentMetadata',
  async (documents, { rejectWithValue }) => {
    try {
      const result = await storeDocuments(documents);
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to store documents';
      return rejectWithValue(errorMessage);
    }
  }
);

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetVerification: (state) => {
      state.documents = null;
      state.documentsByType = {
        identity_proof: [],
        id_proof: [],
        pay_slip: [],
        bank_statement: [],
        property_papers: [],
        licenses: [],
      };
      state.verificationStatus = 'not_started';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Documents
      .addCase(fetchMyDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        state.documents = data;
        
        // Transform API response structure to documentsByType
        // API returns: { documents: [{ docType: "...", docs: [...], count: N }, ...] }
        // We need: { identity_proof: [...], id_proof: [...], ... }
        const documentsByType = {
          identity_proof: [],
          id_proof: [],
          pay_slip: [],
          bank_statement: [],
          property_papers: [],
          licenses: [],
          utility_bill: [],
          other: [],
        };
        
        // Transform documents array to documentsByType object
        if (data?.documents && Array.isArray(data.documents)) {
          data.documents.forEach((docGroup) => {
            const docType = docGroup.docType;
            if (docGroup.docs && Array.isArray(docGroup.docs) && docGroup.docs.length > 0) {
              // Initialize array if it doesn't exist (for new document types)
              if (!documentsByType[docType]) {
                documentsByType[docType] = [];
              }
              // Add all documents for this type
              documentsByType[docType] = docGroup.docs;
            }
          });
        }
        
        // Log for debugging
        console.log('Transformed documentsByType:', documentsByType);
        console.log('Total documents by type:', Object.keys(documentsByType).map(type => ({
          type,
          count: documentsByType[type].length
        })));
        
        state.documentsByType = documentsByType;
        state.verificationStatus = data?.userInfo?.verificationStatus || data?.verificationStatus || 'not_started';
        state.error = null;
      })
      .addCase(fetchMyDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Documents
      .addCase(uploadDocuments.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadDocuments.fulfilled, (state) => {
        state.uploading = false;
        state.error = null;
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // Store Document Metadata
      .addCase(storeDocumentMetadata.pending, (state) => {
        state.storing = true;
        state.error = null;
      })
      .addCase(storeDocumentMetadata.fulfilled, (state) => {
        state.storing = false;
        state.error = null;
        // Refresh documents after storing
      })
      .addCase(storeDocumentMetadata.rejected, (state, action) => {
        state.storing = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetVerification } = verificationSlice.actions;
export default verificationSlice.reducer;

