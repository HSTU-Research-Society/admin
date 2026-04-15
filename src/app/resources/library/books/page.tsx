"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Books",
  addButtonLabel: "+ Add Book",
  collectionName: "library_books",
  sortField: "title",
  sortDir: "asc",
  searchFields: ["title", "author", "description"],
  fields: [
    { name: "title",       label: "Title",               type: "text",     required: true,  display: "title",       placeholder: "e.g. Research Methodology by Kothari" },
    { name: "author",      label: "Author",              type: "text",     required: true,  display: "meta",        placeholder: "e.g. C.R. Kothari" },
    { name: "category",    label: "Category",            type: "select",   required: true,  display: "badge",       options: ["Research Methodology", "Subject Book", "Open Textbook", "Reference Book", "Other"] },
    { name: "edition",     label: "Edition",             type: "text",                      display: "meta",        placeholder: "e.g. 4th Edition" },
    { name: "coverImage",  label: "Cover Image URL",     type: "url",                       display: "none",        placeholder: "https://imgur.com/..." },
    { name: "downloadLink",label: "Download / External", type: "url",                       display: "link",        linkLabel: "Access Book",         placeholder: "https://..." },
    { name: "description", label: "Description",         type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Brief description of the book's content and relevance..." },
  ],
};

export default function BooksPage() { return <GenericResourceManager config={config} />; }
