/**
 * Shared type definitions for memory protection utilities
 */

/**
 * Basic interface for array-like objects with length
 */
export interface ArrayBufferLike {
  length: number;
}

/**
 * Interface for objects that can be wiped securely (Buffer-like)
 */
export interface BufferLike extends ArrayBufferLike {
  fill(value: number): BufferLike;
  set?(array: Uint8Array): void;
} 