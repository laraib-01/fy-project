import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  DateInput,
  Input,
  TimeInput,
  ModalFooter,
  DatePicker,
  Button,
  ToastProvider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import TeacherLayout from "./TeacherLayout";
import axios from "axios";

export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isOpen: isEventModalOpen,
    onOpen: onEventModalOpen,
    onOpenChange: onEventModalOpenChange,
  } = useDisclosure();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("educonnect_token");
      const response = await axios.get("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUpcomingEvents(response.data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
      addToast({
        title: "Error",
        description: "Unable to load events.",
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
    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setIsEditing(false);
    setCurrentEventId(null);
  };

  const handlePostEvent = async () => {
    if (!eventTitle || !eventDate || !eventTime || !eventLocation) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all fields",
        status: "warning",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("educonnect_token");

      // Format date for API
      const formattedDate = eventDate.toString();

      // Format time for API
      const formattedTime = `${eventTime.hour
        .toString()
        .padStart(2, "0")}:${eventTime.minute.toString().padStart(2, "0")}`;

      const payload = {
        title: eventTitle,
        date: formattedDate,
        time: formattedTime,
        location: eventLocation,
      };

      if (isEditing && currentEventId) {
        await axios.put(
          `http://localhost:5000/api/events/${currentEventId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        addToast({
          title: "Updated",
          description: "Event updated successfully.",
          status: "success",
        });
      } else {
        await axios.post("http://localhost:5000/api/save-event", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        addToast({
          title: "Success",
          description: "Event added successfully.",
          status: "success",
        });
      }

      onEventModalOpenChange(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error submitting event:", error);
      addToast({
        title: "Error",
        description: "Unable to submit event.",
        status: "error",
      });
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("educonnect_token");
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      addToast({
        title: "Deleted",
        description: "Event deleted successfully.",
        status: "success",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      addToast({
        title: "Error",
        description: "Unable to delete event.",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    setEventTitle(event.title);

    // Parse the date string from the API
    try {
      setEventDate(event.date);
    } catch (e) {
      console.error("Error parsing date:", e);
      setEventDate(null);
    }

    // Parse the time string from the API
    try {
      const [hours, minutes] = event.time.split(":").map(Number);
      setEventTime(new Time(hours, minutes));
    } catch (e) {
      console.error("Error parsing time:", e);
      setEventTime(null);
    }

    setEventLocation(event.location);
    setCurrentEventId(event.id);
    setIsEditing(true);
    onEventModalOpen();
  };

  return (
    <TeacherLayout>
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
                  value={eventTitle}
                  onValueChange={setEventTitle}
                  isRequired
                />
                <Input
                  type="date"
                  label="Date"
                  placeholder="Enter event date"
                  value={eventDate}
                  onValueChange={setEventDate}
                  isRequired
                />
                {/* <DatePicker
                  label="Date"
                  value={eventDate}
                  onChange={setEventDate}
                  isRequired
                /> */}
                <TimeInput
                  label="Time"
                  value={eventTime}
                  onChange={setEventTime}
                  isRequired
                />
                <Input
                  label="Location"
                  placeholder="Enter event location"
                  value={eventLocation}
                  onValueChange={setEventLocation}
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
                  onPress={handlePostEvent}
                  isLoading={isLoading}
                >
                  {isEditing ? "Update Event" : "Post Event"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </TeacherLayout>
  );
}
