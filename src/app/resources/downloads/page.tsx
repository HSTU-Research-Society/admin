"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Downloads",
  addButtonLabel: "+ Add File",
  collectionName: "resources_downloads",
  sortField: "category",
  sortDir: "asc",
  searchFields: ["fileName", "category", "description"],
  fields: [
    { name: "fileName",    label: "File Name",    type: "text",     required: true,  display: "title",       placeholder: "e.g. HSTU Membership Form 2025" },
    { name: "category",    label: "Category",     type: "select",   required: true,  display: "badge",       options: ["Form", "Membership Doc", "Logo", "Template", "IEEE Template", "LaTeX Template", "Other"] },
    { name: "size",        label: "File Size",    type: "text",                      display: "meta",        placeholder: "e.g. 1.2 MB" },
    { name: "fileLink",    label: "File Link",    type: "url",      required: true,  display: "link",        linkLabel: "Download File" },
    { name: "description", label: "Description",  type: "textarea",                  display: "description", fullWidth: true, placeholder: "What this file is for..." },
  ],
};

export default function DownloadsPage() { return <GenericResourceManager config={config} />; }
