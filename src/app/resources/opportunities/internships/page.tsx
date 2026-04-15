"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Internships",
  addButtonLabel: "+ Add Internship",
  collectionName: "opp_internships",
  sortField: "deadline",
  sortDir: "asc",
  searchFields: ["title", "company", "description"],
  fields: [
    { name: "title",       label: "Title",           type: "text",     required: true,  display: "title",       placeholder: "e.g. Machine Learning Intern" },
    { name: "company",     label: "Company / Lab",   type: "text",     required: true,  display: "badge",       placeholder: "e.g. Google DeepMind" },
    { name: "location",    label: "Location",        type: "text",     required: true,  display: "meta",        placeholder: "e.g. Remote / London, UK" },
    { name: "duration",    label: "Duration",        type: "text",     required: true,  display: "meta",        placeholder: "e.g. 3 months" },
    { name: "deadline",    label: "Deadline",        type: "date",     required: true,  display: "meta" },
    { name: "applyLink",   label: "Apply Link",      type: "url",      required: true,  display: "link",        linkLabel: "Apply Now" },
    { name: "description", label: "Description",     type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Role description, requirements, and perks..." },
  ],
};

export default function InternshipsPage() { return <GenericResourceManager config={config} />; }
