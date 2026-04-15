"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Volunteer Calls",
  addButtonLabel: "+ Post Call",
  collectionName: "volunteer_calls",
  sortField: "deadline",
  sortDir: "asc",
  searchFields: ["title", "role", "description"],
  fields: [
    { name: "title",           label: "Title",            type: "text",     required: true,  display: "title",       placeholder: "e.g. Research Team Volunteers Needed" },
    { name: "role",            label: "Role",             type: "text",     required: true,  display: "badge",       placeholder: "e.g. Research Team, Media Team, Event Support" },
    { name: "status",          label: "Status",           type: "select",   required: true,  display: "badge",       options: ["Open", "Closed"] },
    { name: "deadline",        label: "Deadline",         type: "date",     required: true,  display: "meta" },
    { name: "duration",        label: "Duration",         type: "text",                      display: "meta",        placeholder: "e.g. 3 months (optional)" },
    { name: "requirements",    label: "Requirements",     type: "textarea", required: true,  display: "none",        fullWidth: true, placeholder: "List the requirements for this role..." },
    { name: "responsibilities",label: "Responsibilities", type: "textarea", required: true,  display: "none",        fullWidth: true, placeholder: "Key responsibilities for the volunteer..." },
    { name: "applyLink",       label: "Application Link", type: "url",                       display: "link",        linkLabel: "Apply Now" },
    { name: "description",     label: "Description",      type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Overview of this volunteer opportunity..." },
  ],
};

export default function VolunteerCallPage() {
  return <GenericResourceManager config={config} />;
}
