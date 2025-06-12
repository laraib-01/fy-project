import React from "react";
import { Card, CardBody, Input, Switch, Button } from "@heroui/react";
import { AdminLayout } from "../components/admin/AdminLayout";

export const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-lg font-semibold">General Settings</h2>
            <Input label="Platform Name" placeholder="EduConnect" />
            <Input label="Support Email" placeholder="support@example.com" />
            <Switch defaultSelected>Enable Notifications</Switch>
            <Switch>Maintenance Mode</Switch>
            <Button color="primary" className="mt-4">
              Save Settings
            </Button>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
};
