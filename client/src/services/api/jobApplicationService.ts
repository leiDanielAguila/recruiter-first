/**
 * Job Application API Service with TanStack Query integration.
 *
 * Provides hooks for CRUD operations on job applications with proper
 * caching, error handling, and automatic invalidation.
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/api";
import type {
  JobApplication,
  JobApplicationCreate,
  JobApplicationUpdate,
} from "@/models/job_application";

type ApiJobApplication = {
  id: string;
  user_id: string;
  job: string;
  company: string;
  date: string;
  status: JobApplication["status"];
  description: string;
  hiring_manager_name: string;
  requirements: string[];
  created_at: string;
  updated_at: string;
};

type ApiJobApplicationListResponse = {
  applications: ApiJobApplication[];
  total: number;
};

type ApiJobApplicationCreatePayload = {
  job: string;
  company: string;
  date: string;
  status: JobApplicationCreate["status"];
  description: string;
  hiring_manager_name: string;
  requirements: string[];
};

type ApiJobApplicationUpdatePayload = Partial<ApiJobApplicationCreatePayload>;

const QUERY_KEYS = {
  jobApplications: ["job-applications"] as const,
  jobApplicationsList: () => [...QUERY_KEYS.jobApplications, "list"] as const,
  jobApplicationById: (id: string) =>
    [...QUERY_KEYS.jobApplications, id] as const,
};

async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem("rf_auth_session_v1");
  let accessToken = "";

  if (token) {
    try {
      const session = JSON.parse(token);
      accessToken = session.accessToken;
    } catch {
      throw new Error("Please sign in to continue.");
    }
  }

  if (!accessToken) {
    throw new Error("Please sign in to continue.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Something went wrong. Please try again.",
    }));
    throw new Error(error.detail || "Request failed");
  }

  return response;
}

function toDomainJobApplication(
  apiApplication: ApiJobApplication,
): JobApplication {
  return {
    id: apiApplication.id,
    userId: apiApplication.user_id,
    job: apiApplication.job,
    company: apiApplication.company,
    date: apiApplication.date,
    status: apiApplication.status,
    description: apiApplication.description,
    hiringManagerName: apiApplication.hiring_manager_name,
    requirements: apiApplication.requirements ?? [],
    createdAt: apiApplication.created_at,
    updatedAt: apiApplication.updated_at,
  };
}

function toApiCreatePayload(
  data: JobApplicationCreate,
): ApiJobApplicationCreatePayload {
  return {
    job: data.job,
    company: data.company,
    date: data.date,
    status: data.status,
    description: data.description,
    hiring_manager_name: data.hiringManagerName,
    requirements: data.requirements,
  };
}

function toApiUpdatePayload(
  data: JobApplicationUpdate,
): ApiJobApplicationUpdatePayload {
  const payload: ApiJobApplicationUpdatePayload = {};

  if (data.job !== undefined) payload.job = data.job;
  if (data.company !== undefined) payload.company = data.company;
  if (data.date !== undefined) payload.date = data.date;
  if (data.status !== undefined) payload.status = data.status;
  if (data.description !== undefined) payload.description = data.description;
  if (data.hiringManagerName !== undefined) {
    payload.hiring_manager_name = data.hiringManagerName;
  }
  if (data.requirements !== undefined) payload.requirements = data.requirements;

  return payload;
}

async function getJobApplications(): Promise<JobApplication[]> {
  const response = await fetchWithAuth(API_ENDPOINTS.jobApplications.list);
  const data: ApiJobApplicationListResponse = await response.json();

  return data.applications.map(toDomainJobApplication);
}

async function getJobApplicationById(id: string): Promise<JobApplication> {
  const response = await fetchWithAuth(API_ENDPOINTS.jobApplications.byId(id));
  const data: ApiJobApplication = await response.json();
  return toDomainJobApplication(data);
}

async function createJobApplication(
  data: JobApplicationCreate,
): Promise<JobApplication> {
  const response = await fetchWithAuth(API_ENDPOINTS.jobApplications.create, {
    method: "POST",
    body: JSON.stringify(toApiCreatePayload(data)),
  });
  const created: ApiJobApplication = await response.json();
  return toDomainJobApplication(created);
}

async function updateJobApplication(
  id: string,
  data: JobApplicationUpdate,
): Promise<JobApplication> {
  const response = await fetchWithAuth(API_ENDPOINTS.jobApplications.byId(id), {
    method: "PATCH",
    body: JSON.stringify(toApiUpdatePayload(data)),
  });
  const updated: ApiJobApplication = await response.json();
  return toDomainJobApplication(updated);
}

async function deleteJobApplication(id: string): Promise<void> {
  await fetchWithAuth(API_ENDPOINTS.jobApplications.byId(id), {
    method: "DELETE",
  });
}

export function useJobApplications(): UseQueryResult<JobApplication[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.jobApplicationsList(),
    queryFn: getJobApplications,
    staleTime: 60000, // 1 minute
    retry: false, // Don't retry on auth failures
  });
}

export function useJobApplication(
  id: string,
): UseQueryResult<JobApplication, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.jobApplicationById(id),
    queryFn: () => getJobApplicationById(id),
    staleTime: 60000,
    enabled: !!id,
  });
}

export function useCreateJobApplication(): UseMutationResult<
  JobApplication,
  Error,
  JobApplicationCreate
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJobApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.jobApplicationsList(),
      });
    },
  });
}

export function useUpdateJobApplication(): UseMutationResult<
  JobApplication,
  Error,
  { id: string; data: JobApplicationUpdate }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateJobApplication(id, data),
    onSuccess: (updatedApp) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.jobApplicationsList(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.jobApplicationById(updatedApp.id),
      });
    },
  });
}

export function useDeleteJobApplication(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJobApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.jobApplicationsList(),
      });
    },
  });
}
