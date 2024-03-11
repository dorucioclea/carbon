import type { Database } from "@carbon/database";

export function getLineDescription(
  line: Database["public"]["Tables"]["quoteLineQuantity"]["Row"]
) {
  return line?.quantity;
}

// export function getLineTotal(
//     line: Database["public"]["Tables"]["quoteLine"]["Row"]
// ) {
//     console.log(line);
// }
