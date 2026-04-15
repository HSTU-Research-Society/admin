"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Fellowships",
  addButtonLabel: "+ Add Fellowship",
  collectionName: "opp_fellowships",
  sortField: "deadline",
  sortDir: "asc",
  searchFields: ["title", "organization", "eligibility"],
  fields: [
    { name: "title",        label: "Title",        type: "text",  required: true,  display: "title",  placeholder: "e.g. Gates Cambridge Fellowship" },
    { name: "organization", label: "Organization", type: "text",  required: true,  display: "badge",  placeholder: "e.g. Gates Foundation" },
    { name: "duration",     label: "Duration",     type: "text",  required: true,  display: "meta",   placeholder: "e.g. 1 year" },
    { name: "eligibility",  label: "Eligibility",  type: "text",  required: true,  display: "meta",   placeholder: "e.g. PhD students in STEM" },
    { name: "deadline",     label: "Deadline",     type: "date",  required: true,  display: "meta" },
    { name: "applyLink",    label: "Apply Link",   type: "url",   required: true,  display: "link",   linkLabel: "Apply Now" },
  ],
};

export default function FellowshipsPage() { return <GenericResourceManager config={config} />; }
