import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

(globalThis as typeof globalThis & { TextDecoder: typeof TextDecoder; TextEncoder: typeof TextEncoder }).TextDecoder = TextDecoder;
(globalThis as typeof globalThis & { TextDecoder: typeof TextDecoder; TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
