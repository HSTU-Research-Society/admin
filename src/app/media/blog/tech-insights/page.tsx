"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Technology Insights",
  addButtonLabel: "+ Write Insight",
  collectionName: "blog_tech_insights",
  sortField: "publishDate",
  sortDir: "desc",
  searchFields: ["title", "author", "content", "tags"],
  fields: [
    { name: "title",       label: "Title",              type: "text",     required: true,  display: "title",       fullWidth: true, placeholder: "e.g. Is AI Replacing Traditional Simulation?" },
    { name: "author",      label: "Author",             type: "text",     required: true,  display: "meta",        placeholder: "e.g. Dr. John Doe" },
    { name: "authorRole",  label: "Author Role",        type: "text",                      display: "meta",        placeholder: "e.g. Associate Professor (optional)" },
    { name: "category",    label: "Category",           type: "select",   required: true,  display: "badge",       options: ["AI & ML", "Smart Grid", "Quantum Computing", "Engineering Innovation", "Research Tools", "Opinion Piece", "Industry Trend", "Other"] },
    { name: "tags",        label: "Tags (comma-sep.)",  type: "text",                      display: "none",        placeholder: "AI, Smart Grid, Future Tech" },
    { name: "coverImage",  label: "Cover Image URL",    type: "url",                       display: "none",        placeholder: "https://imgur.com/..." },
    { name: "publishDate", label: "Publish Date",       type: "date",     required: true,  display: "meta" },
    { name: "readTime",    label: "Read Time",          type: "text",                      display: "meta",        placeholder: "e.g. 6 min read" },
    { name: "featured",    label: "Featured",           type: "select",                    display: "badge",       options: ["Yes", "No"] },
    { name: "content",     label: "Content",            type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Your insight, analysis, or opinion piece..." },
  ],
};

export default function TechInsightsPage() {
  return <GenericResourceManager config={config} />;
}
