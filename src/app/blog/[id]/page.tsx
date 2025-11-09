import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

type Props = {
  params: { id: string };
};

export default function LegacyBlogDetailRedirect({ params }: Props) {
  redirect(`/${defaultLocale}/blog/${params.id}`);
}
