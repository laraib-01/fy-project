import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  ModalFooter,
  Button,
  Textarea,
  Spinner,
  ToastProvider,
  TimeInput,
  DatePicker,
  DateInput,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import axios from "axios";
import eventsService from "../services/eventsService";

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    event_name: "",
    event_date: null,
    event_time: "",
    event_location: "",
    description: "",
  });

  console.log(formData)

  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  const {
    isOpen: isEventModalOpen,
    onOpen: onEventModalOpen,
    onOpenChange: onEventModalOpenChange,
  } = useDisclosure();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsService.getEvents({
        school_id: localStorage.getItem("educonnect_school_id"),
        status: "past",
        limit: 5,
        page: 1,
      });

      if (response && response.data) {
        setEvents(response.data.events || []);
        setUpcomingEvents(response.data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      addToast({
        title: "Error",
        description: error.message || "Unable to load events",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setFormData({
      event_name: "",
      event_date: null,
      event_time: "",
      event_location: "",
      description: "",
    });
    setIsEditing(false);
    setCurrentEventId(null);
  };

  const handleInputChange = (key, value) => {
    
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.event_name ||
      !formData.event_date ||
      !formData.event_time ||
      !formData.event_location
    ) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "warning",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && currentEventId) {
        await eventsService.updateEvent(currentEventId, formData);
        addToast({
          title: "Success",
          description: "Event updated successfully",
          status: "success",
        });
      } else {
        await eventsService.createEvent(formData);
        addToast({
          title: "Success",
          description: "Event created successfully",
          status: "success",
        });
      }

      onEventModalOpenChange(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to save event",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      setIsLoading(true);
      await eventsService.deleteEvent(id);
      addToast({
        title: "Success",
        description: "Event deleted successfully",
        status: "success",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to delete event",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    setFormData({
      event_name: event.event_name,
      event_date: event.event_date,
      event_time: event.event_time,
      event_location: event.event_location,
      description: event.description || "",
    });
    setCurrentEventId(event.event_id);
    setIsEditing(true);
    onEventModalOpen();
  };

  const formatDateTime = (dateStr, timeStr) => {
    try {
      const date = new Date(dateStr);
      const time = timeStr ? new Date(`1970-01-01T${timeStr}`) : null;

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      const formattedDate = date.toLocaleDateString(undefined, options);
      const formattedTime = time
        ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

      return `${formattedDate}${formattedTime ? " at " + formattedTime : ""}`;
    } catch (e) {
      console.error("Error formatting date/time:", e);
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <ToastProvider placement="bottom-center" toastOffset={0} />
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-foreground-600">Manage your events</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={() => {
                resetForm();
                onEventModalOpen();
              }}
            >
              Add Event
            </Button>
          </div>

          <Card>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Icon
                    icon="lucide:calendar"
                    className="text-foreground-400 w-12 h-12 mb-4"
                  />
                  <h4 className="text-lg font-medium mb-2">No events yet</h4>
                  <p className="text-foreground-500 max-w-md">
                    Create your first event by clicking the "Add Event" button
                    above.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 border-b border-divider pb-6 last:border-0"
                    >
                      <div className="bg-content2 rounded-lg p-3 text-center min-w-[80px]">
                        <div className="text-sm text-foreground-500">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </div>
                        <div className="text-2xl font-bold">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-xs text-foreground-500">
                          {new Date(event.date).getFullYear()}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-lg font-medium">{event.title}</h4>
                        <div className="flex items-center gap-2 mt-2 text-sm text-foreground-600">
                          <Icon
                            icon="lucide:clock"
                            className="text-foreground-400"
                          />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-foreground-600">
                          <Icon
                            icon="lucide:map-pin"
                            className="text-foreground-400"
                          />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          onPress={() => handleEditEvent(event)}
                          isDisabled={isLoading}
                        >
                          <Icon icon="lucide:edit-2" />
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          color="danger"
                          onPress={() => handleDeleteEvent(event.id)}
                          isDisabled={isLoading}
                        >
                          <Icon icon="lucide:trash-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Event Modal */}
      <Modal isOpen={isEventModalOpen} onOpenChange={onEventModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? "Edit Event" : "Create Event"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Title"
                  placeholder="Enter event title"
                  value={formData?.event_name}
                  onChange={(value) => handleInputChange("event_name", value)}
                  isRequired
                />
                <Textarea
                  label="Description"
                  placeholder="Enter event description"
                  value={formData?.event_description}
                  onChange={(value) => handleInputChange("event_description", value)}
                  isRequired
                />
                <DateInput
                  label="Date"
                  placeholder="Enter event date"
                  value={formData?.event_date}
                  onChange={(value) => handleInputChange("event_date", value)}
                  isRequired
                />
                <TimeInput
                  label="Time"
                  value={formData?.event_time}
                  onChange={(value) => handleInputChange("event_time", value)}
                  isRequired
                />
                <Input
                  label="Location"
                  placeholder="Enter event location"
                  value={formData?.event_location}
                  onChange={(value) => handleInputChange("event_location", value)}
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    resetForm();
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  // onPress={handlePostEvent}
                  isLoading={isLoading}
                >
                  {isEditing ? "Update Event" : "Post Event"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
