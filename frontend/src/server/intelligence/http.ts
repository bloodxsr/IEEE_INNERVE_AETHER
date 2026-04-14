import { NextResponse } from "next/server";

export const getClientIp = (request: Request): string => {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim();
  return first || "127.0.0.1";
};

export const parseJsonBody = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
};

export const badRequest = (error: string) => NextResponse.json({ success: false, error }, { status: 400 });
export const serverError = (error: unknown) =>
  NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error.",
    },
    { status: 500 }
  );
