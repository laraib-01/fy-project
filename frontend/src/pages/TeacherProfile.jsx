import React from "react";
import { Card, CardBody, Input, Button, Avatar } from "@heroui/react";

export const TeacherProfile = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      <Card>
        <CardBody className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar
              size="lg"
              src="https://img.heroui.chat/image/avatar?w=200&h=200&u=admin"
            />
            <div>
              <h2 className="text-lg font-semibold">Admin User</h2>
              <p className="text-foreground-500 text-sm">admin@example.com</p>
            </div>
          </div>

          <Input label="Full Name" placeholder="Admin User" />
          <Input label="Email" placeholder="admin@example.com" />
          <Input label="Phone" placeholder="+1 (555) 555-1234" />

          <h2 className="text-lg font-semibold mt-6">Change Password</h2>
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />

          <Button color="primary">Update Profile</Button>
        </CardBody>
      </Card>
    </div>
  );
};
