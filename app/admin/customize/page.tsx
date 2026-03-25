// app/admin/customize/page.tsx

import { CustomizationPanel } from "@/components/dashboard/customization/customization-panel";

export const metadata = {
    title: "Customize",
    description: "Personalize the look and feel of your admin dashboard.",
};

export default function CustomizePage() {
    return <CustomizationPanel />;
}