export type CoverLetterGeneratePayload = {
  jobTitle: string;
  hiringManagerName: string;
  email: string;
  phone: string;
  requirements: string[];
  company?: string;
};

export type CoverLetterGenerateResult = {
  documentId: string;
  coverLetter: string;
};

export type ApiCoverLetterGeneratePayload = {
  job_title: string;
  hiring_manager_name: string;
  email: string;
  phone: string;
  requirements: string[];
  company: string;
};

export type ApiCoverLetterGenerateResponse = {
  document_id: string;
  cover_letter: string;
};
