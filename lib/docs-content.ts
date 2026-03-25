// lib/docs-content.ts
import { TocItem } from "@/lib/navigation";

export interface DocContent {
    title: string;
    description: string;
    toc: TocItem[];
    slug: string;
}

const docsContent: Record<string, DocContent> = {
    introduction: {
        title: "Introduction",
        description:
            "Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.",
        slug: "introduction",
        toc: [
            { id: "about", title: "About" },
            { id: "philosophy", title: "Philosophy" },
            { id: "faq", title: "FAQ" },
            { id: "credits", title: "Credits" },
        ],
    },
    installation: {
        title: "Installation",
        description:
            "How to install dependencies and structure your app.",
        slug: "installation",
        toc: [
            { id: "prerequisites", title: "Prerequisites" },
            { id: "create-project", title: "Create Project" },
            { id: "run-cli", title: "Run the CLI" },
            { id: "configure-components", title: "Configure components.json" },
            { id: "thats-it", title: "That's it" },
        ],
    },

    button: {
        title: "Button",
        description: "Displays a button or a component that looks like a button.",
        slug: "button",
        toc: [
            { id: "installation", title: "Installation" },
            { id: "usage", title: "Usage" },
            { id: "examples", title: "Examples" },
            { id: "primary", title: "Primary" },
            { id: "secondary", title: "Secondary" },
            { id: "destructive", title: "Destructive" },

        ],
    },
};

// Generate content for any component that isn't explicitly defined
function generateGenericDoc(slug: string): DocContent {
    const title = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return {
        title,
        description: `Showing contents of ${title.toLowerCase()} for your worlflow.`,
        slug,
        toc: [
            { id: "installation", title: "Installation" },
            { id: "usage", title: "Usage" },
            { id: "examples", title: "Examples" },
            { id: "api-reference", title: "API Reference" },
        ],
    };
}

export function getDocContent(slug: string): DocContent {
    return docsContent[slug] || generateGenericDoc(slug);
}

export function getAllDocSlugs(): string[] {
    const explicit = Object.keys(docsContent);
    // Also gather from navigation
    const { navigation } = require("./navigation");
    const navSlugs = navigation.flatMap((cat: any) =>
        cat.items.map((item: any) => item.href.replace("/admin/", ""))
    );
    return [...new Set([...explicit, ...navSlugs])];
}