"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Scholarships",
  addButtonLabel: "+ Add Scholarship",
  collectionName: "opp_scholarships",
  sortField: "deadline",
  sortDir: "asc",
  searchFields: ["title", "organization", "description"],
  fields: [
    { name: "title",        label: "Title",        type: "text",     required: true,  display: "title",       placeholder: "e.g. Commonwealth Scholarship 2025" },
    { name: "organization", label: "Organization", type: "text",     required: true,  display: "badge",       placeholder: "e.g. British Council" },
    { name: "eligibility",  label: "Eligibility",  type: "text",     required: true,  display: "meta",        placeholder: "e.g. Final year undergraduate students" },
    { name: "amount",       label: "Amount",       type: "text",                      display: "meta",        placeholder: "e.g. $5,000 / Full Funding" },
    { name: "deadline",     label: "Deadline",     type: "date",     required: true,  display: "meta" },
    { name: "applyLink",    label: "Apply Link",   type: "url",      required: true,  display: "link",        linkLabel: "Apply Now" },
    { name: "description",  label: "Description",  type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Scholarship details and requirements..." },
  ],
};

export default function ScholarshipsPage() { return <GenericResourceManager config={config} />; }
