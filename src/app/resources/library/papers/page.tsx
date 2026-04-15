"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Research Papers",
  addButtonLabel: "+ Add Paper",
  collectionName: "library_papers",
  sortField: "year",
  sortDir: "desc",
  searchFields: ["title", "authors", "abstract", "tags"],
  fields: [
    { name: "title",            label: "Title",                   type: "text",     required: true, display: "title",       fullWidth: true, placeholder: "Full paper title" },
    { name: "authors",          label: "Authors",                 type: "text",     required: true, display: "meta",        placeholder: "e.g. LeCun, Bengio, Hinton" },
    { name: "journalConference",label: "Journal / Conference",    type: "text",     required: true, display: "meta",        placeholder: "e.g. Nature, IEEE CVPR" },
    { name: "year",             label: "Year",                    type: "number",   required: true, display: "badge",       placeholder: "2024" },
    { name: "tags",             label: "Tags (comma-separated)",  type: "text",                     display: "none",        placeholder: "AI, Deep Learning, NLP" },
    { name: "pdfLink",          label: "PDF Link",                type: "url",                      display: "link",        linkLabel: "Download PDF" },
    { name: "abstract",         label: "Abstract",                type: "textarea", required: true, display: "description", fullWidth: true, placeholder: "Paper abstract..." },
  ],
};

export default function LibraryPapersPage() { return <GenericResourceManager config={config} />; }
