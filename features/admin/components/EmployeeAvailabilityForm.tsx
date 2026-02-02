"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Button,
  DatePicker,
  Chip,
  Input,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useEmployeeAvailabilityForm } from "../hooks/useEmployeeAvailabilityForm";
import { AvailabilitySlot } from "../store/useEmployeeAvailabilityStore";

interface EmployeeAvailabilityFormProps {
  employeeId: string;
  onSuccess?: () => void;
}



export default function EmployeeAvailabilityForm({
  employeeId,
  onSuccess,
}: EmployeeAvailabilityFormProps) {
  const {
    selectedDate,
    setSelectedDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    availableSlots,
    isSubmitting,
    submitMessage,
    errorMessage,
    addSlot,
    removeSlot,
    handleSubmit
  } = useEmployeeAvailabilityForm(employeeId, onSuccess);

  // 格式化日期和时间显示
  const formatSlotDisplay = (slot: AvailabilitySlot) => {
    const date = new Date(slot.date + "T00:00:00");
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return `${dateStr} ${slot.startTime} - ${slot.endTime}`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <h3 className="text-xl font-semibold">Submit Availability</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select dates and time slots you are available to work
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minValue={parseDate(new Date().toISOString().split("T")[0])}
              fullWidth
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="time"
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
              />
              <Input
                type="time"
                label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
              />
            </div>

            <Button
              type="button"
              color="primary"
              variant="flat"
              onPress={addSlot}
              isDisabled={!selectedDate || !startTime || !endTime}
              fullWidth
            >
              Add Time Slot
            </Button>
          </div>

          {/* 已选择的时间段列表 */}
          {availableSlots.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Time Slots ({availableSlots.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot) => (
                  <Chip
                    key={slot.id}
                    onClose={() => removeSlot(slot.id)}
                    variant="flat"
                    color="primary"
                    className="cursor-pointer"
                  >
                    {formatSlotDisplay(slot)}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
              <p className="text-danger-700 dark:text-danger-400 text-sm">
                {errorMessage}
              </p>
            </div>
          )}

          {submitMessage && (
            <div className="p-4 bg-success-100 dark:bg-success-900/30 border-2 border-success-400 dark:border-success-600 rounded-lg">
              <p className="text-success-800 dark:text-success-300 font-semibold text-sm">
                {submitMessage}
              </p>
            </div>
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            className="font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Submit Availability"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

