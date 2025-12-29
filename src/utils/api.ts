// API Endpoints
export const API_END_POINT = {
  AI_CHECK_GRAMMAR_SPELL:
    "https://beta.cheppy.ai/api/ai-integrate/ai/check-grammar",
} as const;

// API Request function
export async function postRequest<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization:
        "Bearer " +
        "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJaVG0xd2ZTZUdEemZFazB5b2RhVzJreGZjcmQ2eU1qUDZaMFl0MWlKNjVzIn0.eyJleHAiOjE3NjcwMDQyMTgsImlhdCI6MTc2Njk3NTQxOCwianRpIjoib25ydHJvOmMxNGIyNGRhLWE5Y2QtNDI3My05NzVkLTkyNmE5OTZhY2I3ZCIsImlzcyI6Imh0dHBzOi8vYmV0YS1pZHAuY2hlcHB5LmFpL3JlYWxtcy9lbHAiLCJzdWIiOiI3YTgxYTliOC1lMDdmLTRjN2ItYmE5YS05M2Y5OGVmZTM1YzciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJlbHAtd2ViIiwic2lkIjoiMTNiOWNkNzQtZWY4Zi00ZjdiLTk4YWMtMWM3YjU4ODJmM2I2IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2VscC5kZXZsZWFkLnRvcCIsImh0dHBzOi8vZWxwLnRlY2Eudm4iLCJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJodHRwczovL2JldGEuY2hlcHB5LmFpIl0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoidGVzdF90ZWFjaGVyMSIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3RfdGVhY2hlcjEiLCJmYW1pbHlfbmFtZSI6InRlc3RfdGVhY2hlcjEiLCJlbWFpbCI6InBoYW10dWFuMTloZEBnbWFpbC5jb20ifQ.faLG15gRk72YWu3AGO77JyvIVvAGS6P1hmwdJ3mAUt9AbJdsqwYl1XPeAYg-Pj1HqYpdComuMJu0r5SFDxKpUh2bFuJ-KwKHp-O_q6fevgKs51mq2kfCNelp-f-AYV9Od7t0Utw0mf5C09HL-LA8_lX9xHCK-1KxslvalZd_ufvGhu3SWYoNYBoybkSj-1UfoTsH9wSYq2XQmxGI8wO8la2t83mheK-RbrOmq-t0G2vjMo5Mp-wJbZGB4DHiNAZDstnaQfk1ou45CTW3fy1oV4ey6rSETU_rEmjL7pPfFuJ524OhIFn_fpR56z3zM6rJRZFD0WbIIKDyO3hc8f78VA",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
