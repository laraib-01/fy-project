import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Badge,
} from "@heroui/react";
import { Icon } from "@iconify/react";

export const TeacherLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    localStorage.removeItem("educonnect_token");
    localStorage.removeItem("educonnect_role");
    window.location.href = "/login";
  };

  const sidebarItems = [
    { name: "Dashboard", icon: "lucide:layout-dashboard", path: "/teacher" },
    { name: "Students", icon: "lucide:users", path: "/teacher/students" },
    // { name: "Classes", icon: "lucide:book-open", path: "/teacher/classes" },
    {
      name: "Assignments",
      icon: "lucide:file-text",
      path: "/teacher/assignments",
    },
    {
      name: "Announcements",
      icon: "lucide:megaphone",
      path: "/teacher/announcements",
    },
    { name: "Events", icon: "lucide:calendar", path: "/teacher/events" },
  ];

  return (
    <div className="flex h-screen bg-content2">
      {/* Sidebar */}
      <div
        className={`bg-content1 border-r border-divider transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        } flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-divider h-16">
          {isSidebarOpen ? (
            <Link to="/teacher" className="flex items-center gap-2">
              <Icon icon="lucide:book-open" className="text-primary text-xl" />
              <span className="font-bold text-lg">EduConnect</span>
            </Link>
          ) : (
            <Icon
              icon="lucide:book-open"
              className="text-primary text-xl mx-auto"
            />
          )}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => setIsSidebarOpen(!isSidebarOpen)}
            className={isSidebarOpen ? "" : "hidden"}
          >
            <Icon icon="lucide:chevron-left" />
          </Button>
        </div>

        <div className="flex-grow overflow-y-auto py-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-foreground-700 hover:bg-content2 transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary-50 text-primary font-medium"
                      : ""
                  }`}
                >
                  <div className="relative">
                    <Icon
                      icon={item.icon}
                      className={`text-xl ${
                        isSidebarOpen ? "mr-3" : "mx-auto"
                      }`}
                    />
                    {item.badge && (
                      <Badge
                        content={item.badge}
                        color="danger"
                        size="sm"
                        className="absolute -top-1 -right-1"
                      />
                    )}
                  </div>
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-divider">
          <Button
            isIconOnly={!isSidebarOpen}
            variant="light"
            className="w-full justify-start"
            onPress={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Icon
              icon={
                isSidebarOpen ? "lucide:chevrons-left" : "lucide:chevrons-right"
              }
              className="text-xl"
            />
            {isSidebarOpen && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Navbar className="border-b border-divider" maxWidth="full">
          <NavbarContent>
            <NavbarItem>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setIsSidebarOpen(!isSidebarOpen)}
                className={isSidebarOpen ? "hidden" : ""}
              >
                <Icon icon="lucide:menu" />
              </Button>
            </NavbarItem>
          </NavbarContent>

          <NavbarContent justify="end">
            {/* <NavbarItem>
              <Button variant="light" isIconOnly className="relative">
                <Icon icon="lucide:bell" />
                <Badge
                  content="5"
                  color="danger"
                  size="sm"
                  className="absolute -top-1 -right-1"
                />
              </Button>
            </NavbarItem> */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button variant="light" className="flex items-center gap-2">
                  <Avatar
                    name="Sarah Ahmed"
                    size="sm"
                    src="https://img.heroui.chat/image/avatar?w=200&h=200&u=teacher"
                  />
                  {isSidebarOpen ? null : <span>Sarah Ahmed</span>}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions">
                {/* <DropdownItem
                  key="profile"
                  startContent={<Icon icon="lucide:user" />}
                  onPress={() => navigate("/teacher/profile")}
                >
                  My Profile
                </DropdownItem> */}
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<Icon icon="lucide:log-out" />}
                  onPress={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarContent>
        </Navbar>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
