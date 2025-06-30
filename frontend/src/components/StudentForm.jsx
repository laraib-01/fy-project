import React from "react";
import { Input, Button } from "@heroui/react";

export const StudentForm = ({ student, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    name: student?.name || "",
    parentName: student?.parentName || "",
    grade: student?.grade || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Student Name"
        placeholder="Enter student name"
        value={formData.name}
        onValueChange={(value) => handleChange("name", value)}
        required
      />
      <Input
        label="Parent Name"
        placeholder="Enter parent name"
        value={formData.parentName}
        onValueChange={(value) => handleChange("parentName", value)}
        required
      />
      <Input
        label="Grade"
        placeholder="Enter grade"
        value={formData.grade}
        onValueChange={(value) => handleChange("grade", value)}
        required
      />
      <div className="flex justify-end gap-2">
        <Button variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" type="submit">
          {student ? "Update" : "Add"} Student
        </Button>
      </div>
    </form>
  );
};
