import type { Character, CharacterListResponse } from "@/types/character";

export const API_BASE = "https://rickandmortyapi.com/api";

export class CharacterNotFoundError extends Error {
  constructor(id: string | number) {
    super(`Character ${id} not found`);
    this.name = "CharacterNotFoundError";
  }
}

export async function getCharacters(page = 1): Promise<CharacterListResponse> {
  const res = await fetch(`${API_BASE}/character?page=${page}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch characters: ${res.status}`);
  return res.json();
}

export async function getCharacter(id: string | number): Promise<Character> {
  const res = await fetch(`${API_BASE}/character/${id}`, {
    next: { revalidate: 3600 },
  });
  if (res.status === 404) throw new CharacterNotFoundError(id);
  if (!res.ok) throw new Error(`Failed to fetch character ${id}: ${res.status}`);
  return res.json();
}
