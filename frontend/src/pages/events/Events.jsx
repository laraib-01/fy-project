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
import {
  parseDate,
  parseTime,
  parseZonedDateTime,
} from "@internationalized/date";
import eventsService from "../../services/eventsService";

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    event_name: "",
    event_date: null,
    event_time: null,
    event_location: "",
    description: "",
  });

  console.log(formData);

  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  const {
    isOpen: isEventModalOpen,
    onOpen: onEventModalOpen,
    onOpenChange: onEventModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteEventModalOpen,
    onOpen: onDeleteEventModalOpen,
    onOpenChange: onDeleteEventModalOpenChange,
  } = useDisclosure();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsService.getEvents({
        school_id: localStorage.getItem("educonnect_school_id"),
        status: "upcoming",
        limit: 5,
        page: 1,
      });

      console.log("response", response);

      setEvents(response?.events || []);
      setUpcomingEvents(response?.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      addToast({
        description: error.message || "Unable to load events",
        color: "error",
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
      event_time: null,
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

  function formatDate(date) {
    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day
    ).padStart(2, "0")}`;
  }

  function formatTime(time) {
    return `${String(time.hour).padStart(2, "0")}:${String(
      time.minute
    ).padStart(2, "0")}:${String(time.second).padStart(2, "0")}.${String(
      time.millisecond
    ).padStart(3, "0")}`;
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (
      !formData.event_name ||
      !formData.event_date ||
      !formData.event_time ||
      !formData.description ||
      !formData.event_location
    ) {
      addToast({
        description: "Please fill in all required fields",
        color: "warning",
      });
      return;
    }

    const formattedDate = formatDate(formData.event_date);
    const formattedTime = formatTime(formData.event_time);

    const payload = {
      event_name: formData.event_name,
      event_date: formattedDate,
      event_time: formattedTime,
      description: formData.description,
      event_location: formData.event_location,
    };

    try {
      setIsSubmitting(true);

      if (isEditing && currentEventId) {
        await eventsService.updateEvent(currentEventId, payload);
        addToast({
          description: "Event updated successfully",
          color: "success",
        });
      } else {
        await eventsService.createEvent(payload);
        addToast({
          description: "Event created successfully",
          color: "success",
        });
      }

      onEventModalOpenChange(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      addToast({
        description: error.message || "Failed to save event",
        color: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setIsLoading(true);
      await eventsService.deleteEvent(currentEventId);
      addToast({
        description: "Event deleted successfully",
        color: "success",
      });
      fetchEvents();
      onDeleteEventModalOpenChange(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      addToast({
        description: error.message || "Failed to delete event",
        color: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    let parsedDate, parsedTime;

    try {
      // Attempt to parse the full ISO string
      const zonedDateTime = parseZonedDateTime(event.event_date);
      parsedDate = zonedDateTime.toCalendarDate();
      parsedTime = zonedDateTime.toTime();
    } catch (error) {
      // Fallback to separate parsing if full ISO string fails
      parsedDate = parseDate(event.event_date.split("T")[0]);
      parsedTime = parseTime(event.event_time);
    }

    setFormData({
      event_name: event.event_name,
      event_date: parsedDate,
      event_time: parsedTime,
      event_location: event.event_location,
      description: event.description || "",
    });
    setCurrentEventId(event.event_id);
    setIsEditing(true);
    onEventModalOpen();
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
                      key={event.event_id}
                      className="flex items-start gap-4 border-b border-divider pb-6 last:border-0"
                    >
                      <div className="bg-content2 rounded-lg p-3 text-center min-w-[80px]">
                        <div className="text-sm text-foreground-500">
                          {new Date(event.event_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                            }
                          )}
                        </div>
                        <div className="text-2xl font-bold">
                          {new Date(event.event_date).getDate()}
                        </div>
                        <div className="text-xs text-foreground-500">
                          {new Date(event.event_date).getFullYear()}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-lg font-medium">
                          {event.event_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 text-sm text-foreground-600">
                          <Icon
                            icon="lucide:clock"
                            className="text-foreground-400"
                          />
                          <span>{event.event_time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-foreground-600">
                          <Icon
                            icon="lucide:map-pin"
                            className="text-foreground-400"
                          />
                          <span>{event.event_location}</span>
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
                          onPress={() => {
                            setCurrentEventId(event.event_id);
                            onDeleteEventModalOpen();
                          }}
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
                  value={formData.event_name}
                  onChange={(e) =>
                    handleInputChange("event_name", e.target.value)
                  }
                  isRequired
                />
                <Textarea
                  label="Description"
                  placeholder="Enter event description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  isRequired
                />
                <DateInput
                  label="Date"
                  placeholder="Enter event date"
                  value={formData.event_date}
                  onChange={(value) => handleInputChange("event_date", value)}
                  isRequired
                />
                <TimeInput
                  label="Time"
                  value={formData.event_time}
                  onChange={(value) => handleInputChange("event_time", value)}
                  isRequired
                />
                <Input
                  label="Location"
                  placeholder="Enter event location"
                  value={formData.event_location}
                  onChange={(e) =>
                    handleInputChange("event_location", e.target.value)
                  }
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
                  onPress={() => handleSubmit()}
                  isLoading={isSubmitting}
                >
                  {isEditing ? "Update Event" : "Post Event"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteEventModalOpen}
        onOpenChange={onDeleteEventModalOpenChange}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Event
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this event?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteEvent}
                  isLoading={isLoading}
                >
                  Delete Event
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
