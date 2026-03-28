import { API_ENDPOINTS } from "@/config/api";
import type {
  ApiCoverLetterGeneratePayload,
  ApiCoverLetterGenerateResponse,
  CoverLetterGeneratePayload,
  CoverLetterGenerateResult,
} from "@/models/cover_letter";

export class CoverLetterError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "CoverLetterError";
    this.statusCode = statusCode;
  }
}

function toApiPayload(
  payload: CoverLetterGeneratePayload,
): ApiCoverLetterGeneratePayload {
  return {
    job_title: payload.jobTitle.trim(),
    hiring_manager_name: payload.hiringManagerName.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    requirements: payload.requirements
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
    company: payload.company?.trim() ?? "",
  };
}

function toDomainResult(
  response: ApiCoverLetterGenerateResponse,
): CoverLetterGenerateResult {
  return {
    documentId: response.document_id,
    coverLetter: response.cover_letter,
  };
}

export async function generateCoverLetter(
  payload: CoverLetterGeneratePayload,
): Promise<CoverLetterGenerateResult> {
  const response = await fetch(API_ENDPOINTS.coverLetter.generate, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiPayload(payload)),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: "Failed to generate cover letter.",
    }));

    throw new CoverLetterError(
      errorData.detail || "Failed to generate cover letter.",
      response.status,
    );
  }

  const data: ApiCoverLetterGenerateResponse = await response.json();
  return toDomainResult(data);
}

export async function exportCoverLetterPdf(documentId: string): Promise<Blob> {
  if (!documentId.trim()) {
    throw new CoverLetterError(
      "No generated cover letter found to export.",
      400,
    );
  }

  const response = await fetch(API_ENDPOINTS.coverLetter.exportPdf(documentId));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: "Failed to export PDF.",
    }));

    throw new CoverLetterError(
      errorData.detail || "Failed to export PDF.",
      response.status,
    );
  }

  return response.blob();
}
