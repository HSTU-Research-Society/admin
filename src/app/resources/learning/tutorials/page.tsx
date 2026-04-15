"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Tutorials",
  addButtonLabel: "+ Add Tutorial",
  collectionName: "learning_tutorials",
  sortField: "title",
  sortDir: "asc",
  searchFields: ["title", "author", "category"],
  fields: [
    { name: "title",       label: "Title",         type: "text",     required: true,  display: "title",       placeholder: "e.g. LaTeX for Beginners: Complete Guide" },
    { name: "category",    label: "Category",      type: "select",   required: true,  display: "badge",       options: ["Research Writing", "LaTeX", "Coding", "Methodology", "Statistics", "Data Analysis", "Other"] },
    { name: "author",      label: "Author",        type: "text",     required: true,  display: "meta",        placeholder: "e.g. Dr. John Doe" },
    { name: "contentLink", label: "Content Link",  type: "url",      required: true,  display: "link",        linkLabel: "View Tutorial" },
    { name: "attachment",  label: "Attachment URL",type: "url",                       display: "link",        linkLabel: "Download Attachment" },
    { name: "description", label: "Description",   type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "What this tutorial covers and who it's for..." },
  ],
};

export default function TutorialsPage() { return <GenericResourceManager config={config} />; }
