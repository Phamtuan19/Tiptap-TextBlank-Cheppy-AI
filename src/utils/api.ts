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
        "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJaVG0xd2ZTZUdEemZFazB5b2RhVzJreGZjcmQ2eU1qUDZaMFl0MWlKNjVzIn0.eyJleHAiOjE3NjY5NjY0NzMsImlhdCI6MTc2NjkzNzY3MywianRpIjoib25ydHJvOjA1NmI4MzcxLTVkYzktNGNjMy1hNDQwLTRkMzJiMDkwMzFjYSIsImlzcyI6Imh0dHBzOi8vYmV0YS1pZHAuY2hlcHB5LmFpL3JlYWxtcy9lbHAiLCJzdWIiOiI3YTgxYTliOC1lMDdmLTRjN2ItYmE5YS05M2Y5OGVmZTM1YzciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJlbHAtd2ViIiwic2lkIjoiYTgyYWE5MmEtNmEzMy00ZmFkLTkwZmQtYTAyMWJhMzM1ODA4IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2VscC5kZXZsZWFkLnRvcCIsImh0dHBzOi8vZWxwLnRlY2Eudm4iLCJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJodHRwczovL2JldGEuY2hlcHB5LmFpIl0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoidGVzdF90ZWFjaGVyMSIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3RfdGVhY2hlcjEiLCJmYW1pbHlfbmFtZSI6InRlc3RfdGVhY2hlcjEiLCJlbWFpbCI6InBoYW10dWFuMTloZEBnbWFpbC5jb20ifQ.h6EJvrN2usCq7A-4Ti0tP9k6_EXJg8DOMoFEFW0colH4fsUtGXAWOuD_MQ7wxvmbOdQGKTTsQlCEyEx_H3Zv0Oy6R9Zn6Qoj4m_W8ZU7ci0OOOTLr9PZgUmQsQvUeAtPtcp1R3ZsbMN1MdcAHiBgWZGxTGu93CYsM2cZTS5WKKvPYMt7hPGG5pla86CGH5XXoXQSbfmwoCjb8QjN7mJBzzgHIh_mHEeh110bjIalEFsoXMAjzc-2kiZUnoRzvs2EkmC-9TEHQVnleBU1kR1WPlct-sDEgHTKQ5ch3VR1yYPlbEE0pUEfpjC5Ot7ZIBG3lWZgNILjB6Is5Bp5gCriwg",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
