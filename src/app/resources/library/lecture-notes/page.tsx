"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Lecture Notes",
  addButtonLabel: "+ Add Notes",
  collectionName: "library_lecture_notes",
  sortField: "title",
  sortDir: "asc",
  searchFields: ["title", "courseTopic", "uploadedBy", "department"],
  fields: [
    { name: "title",       label: "Title",          type: "text",     required: true,  display: "title",       placeholder: "e.g. Introduction to Machine Learning — Week 3" },
    { name: "courseTopic", label: "Course / Topic", type: "text",     required: true,  display: "badge",       placeholder: "e.g. CSE 401 - AI" },
    { name: "uploadedBy",  label: "Uploaded By",    type: "text",     required: true,  display: "meta",        placeholder: "e.g. Prof. John Doe" },
    { name: "department",  label: "Department",     type: "text",     required: true,  display: "meta",        placeholder: "e.g. Dept. of CSE" },
    { name: "pdfLink",     label: "PDF Link",       type: "url",      required: true,  display: "link",        linkLabel: "View / Download Notes" },
    { name: "description", label: "Description",    type: "textarea",                  display: "description", fullWidth: true, placeholder: "Topics covered in these notes..." },
  ],
};

export default function LectureNotesPage() { return <GenericResourceManager config={config} />; }
