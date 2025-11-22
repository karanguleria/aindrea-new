import BidsDetailPage from "@/components/modules/client/BidsDetailPage";
import React from "react";
import { useRouter } from "next/router";

export default function ClientBidsPage() {
  const router = useRouter();
  const { id } = router.query;

  return <BidsDetailPage briefId={id} />;
}

