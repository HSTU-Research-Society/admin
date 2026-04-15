"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Thesis Repository",
  addButtonLabel: "+ Add Thesis",
  collectionName: "library_thesis",
  sortField: "year",
  sortDir: "desc",
  searchFields: ["title", "studentName", "supervisor", "department"],
  fields: [
    { name: "title",       label: "Title",          type: "text",     required: true,  display: "title",       fullWidth: true, placeholder: "Full thesis title" },
    { name: "studentName", label: "Student Name",   type: "text",     required: true,  display: "meta",        placeholder: "e.g. Jane Doe" },
    { name: "supervisor",  label: "Supervisor",     type: "text",     required: true,  display: "meta",        placeholder: "e.g. Dr. John Smith" },
    { name: "department",  label: "Department",     type: "text",     required: true,  display: "badge",       placeholder: "e.g. Dept. of EEE" },
    { name: "thesisType",  label: "Thesis Type",    type: "select",   required: true,  display: "badge",       options: ["Undergraduate", "Masters", "Capstone Project", "PhD"] },
    { name: "year",        label: "Year",           type: "number",   required: true,  display: "meta",        placeholder: "2024" },
    { name: "pdfLink",     label: "PDF Link",       type: "url",                       display: "link",        linkLabel: "Read Thesis" },
    { name: "abstract",    label: "Abstract",       type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Thesis abstract and findings..." },
  ],
};

export default function ThesisPage() { return <GenericResourceManager config={config} />; }
