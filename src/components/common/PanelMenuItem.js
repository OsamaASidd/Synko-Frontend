"use client";
import { useRouter } from "next/navigation";

export default function PanelMenuItem(props) {
  const { link, name } = props;
  const router = useRouter();
  return (
    <h3
      className="cursor-pointer"
      onClick={() => {
        router.push(link);
      }}
    >
      {name}
    </h3>
  );
}
