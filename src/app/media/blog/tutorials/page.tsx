"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Blog Tutorials",
  addButtonLabel: "+ Write Tutorial",
  collectionName: "blog_tutorials",
  sortField: "publishDate",
  sortDir: "desc",
  searchFields: ["title", "author", "content", "tags"],
  fields: [
    { name: "title",       label: "Title",              type: "text",     required: true,  display: "title",       fullWidth: true, placeholder: "e.g. How I Wrote My First Research Paper" },
    { name: "author",      label: "Author",             type: "text",     required: true,  display: "meta",        placeholder: "e.g. Jane Smith" },
    { name: "authorRole",  label: "Author Role",        type: "text",                      display: "meta",        placeholder: "e.g. Undergrad Student (optional)" },
    { name: "category",    label: "Category",           type: "select",   required: true,  display: "badge",       options: ["Research Writing", "MATLAB", "LaTeX", "Reference Management", "Python", "Data Analysis", "Other"] },
    { name: "tags",        label: "Tags (comma-sep.)",  type: "text",                      display: "none",        placeholder: "LaTeX, Zotero, Research" },
    { name: "coverImage",  label: "Cover Image URL",    type: "url",                       display: "none",        placeholder: "https://imgur.com/..." },
    { name: "publishDate", label: "Publish Date",       type: "date",     required: true,  display: "meta" },
    { name: "readTime",    label: "Read Time",          type: "text",                      display: "meta",        placeholder: "e.g. 8 min read" },
    { name: "featured",    label: "Featured",           type: "select",                    display: "badge",       options: ["Yes", "No"] },
    { name: "content",     label: "Content",            type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Step-by-step tutorial content..." },
  ],
};

export default function BlogTutorialsPage() {
  return <GenericResourceManager config={config} />;
}
