"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const blogFields: ResourceConfig["fields"] = [
  { name: "title",       label: "Title",               type: "text",     required: true,  display: "title",    fullWidth: true, placeholder: "e.g. Machine Learning in Agriculture at HSTU" },
  { name: "author",      label: "Author",              type: "text",     required: true,  display: "meta",     placeholder: "e.g. John Doe" },
  { name: "authorRole",  label: "Author Role",         type: "text",                      display: "meta",     placeholder: "e.g. Research Fellow (optional)" },
  { name: "category",    label: "Category",            type: "select",   required: true,  display: "badge",    options: ["Research Article", "Tutorial", "Technology Insight"] },
  { name: "tags",        label: "Tags (comma-sep.)",   type: "text",                      display: "none",     placeholder: "AI, Agriculture, Machine Learning" },
  { name: "coverImage",  label: "Cover Image URL",     type: "url",                       display: "none",     placeholder: "https://imgur.com/..." },
  { name: "publishDate", label: "Publish Date",        type: "date",     required: true,  display: "meta" },
  { name: "readTime",    label: "Read Time",           type: "text",                      display: "meta",     placeholder: "e.g. 5 min read" },
  { name: "featured",    label: "Featured",            type: "select",                    display: "badge",    options: ["Yes", "No"] },
  { name: "content",     label: "Content",             type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Write the full article content here (Markdown/HTML supported on the frontend)..." },
];

const researchConfig: ResourceConfig = {
  pageTitle: "Research Articles",
  addButtonLabel: "+ Write Article",
  collectionName: "blog_research_articles",
  sortField: "publishDate",
  sortDir: "desc",
  searchFields: ["title", "author", "content", "tags"],
  fields: blogFields,
};

export default function ResearchArticlesPage() {
  return <GenericResourceManager config={researchConfig} />;
}
