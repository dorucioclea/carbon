import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    const { email } = req.body;
    const response = await supabase
      .from("leads")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

    if (response.error) {
      return res
        .status(500)
        .json({ success: false, error: response.error.message });
    } else {
      return res.status(200).json({ success: true });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
