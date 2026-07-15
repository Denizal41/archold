import { ArrowUpRight, CircleAlert } from "lucide-react";
import { ARC_EXPLORER } from "../arc";
import type { Notice } from "../types/escrow";

interface NoticeMessageProps {
  readonly notice?: Notice;
}

export const NoticeMessage = ({ notice }: NoticeMessageProps): React.JSX.Element | null => {
  if (!notice) return null;
  return <p className="notice" role="status">
    <CircleAlert size={16}/>
    <span>{notice.message}{notice.hash && <> <a href={`${ARC_EXPLORER}/tx/${notice.hash}`} target="_blank" rel="noreferrer">View transaction <ArrowUpRight size={12}/></a></>}</span>
  </p>;
};
