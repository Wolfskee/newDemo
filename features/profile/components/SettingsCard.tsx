"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { apiPut, apiPost } from "@/lib/api-client";

export default function SettingsCard() {
    const { user, setUser } = useAuth();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        // 如果有密码更改操作，先验证当前密码
        if (newPassword || confirmPassword || currentPassword) {
            if (!currentPassword) {
                setErrorMessage("Please enter your current password");
                return;
            }
            if (!newPassword) {
                setErrorMessage("Please enter a new password");
                return;
            }
            if (newPassword !== confirmPassword) {
                setErrorMessage("New passwords do not match");
                return;
            }
            if (newPassword.length < 6) {
                setErrorMessage("Password must be at least 6 characters");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const updateData: any = {};

            // 如果有新密码，先验证当前密码
            if (newPassword && currentPassword) {
                if (!user?.email) {
                    setErrorMessage("User email not found");
                    setIsSubmitting(false);
                    return;
                }

                try {
                    // 使用 POST /auth/login 验证当前密码
                    await apiPost("auth/login", {
                        email: user.email,
                        password: currentPassword
                    }, { skipAuth: true });
                    // 如果验证成功，添加新密码到更新数据
                    updateData.password = newPassword;
                } catch (error) {
                    setErrorMessage("Current password is incorrect");
                    setIsSubmitting(false);
                    return;
                }
            }

            // 如果有新照片，添加照片更新
            // 注意：这里需要根据后端API调整，可能需要使用 FormData 或 base64
            if (profileImage) {
                // 将图片转换为 base64（如果后端支持）
                // 或者使用 FormData 进行文件上传
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result as string;
                    updateData.profileImage = base64String;
                    await performUpdate(updateData);
                };
                reader.onerror = () => {
                    setErrorMessage("Failed to read image file");
                    setIsSubmitting(false);
                };
                reader.readAsDataURL(profileImage);
            } else {
                // 如果有更新数据（新密码），执行更新
                if (Object.keys(updateData).length > 0) {
                    await performUpdate(updateData);
                } else {
                    setErrorMessage("No changes to save");
                    setIsSubmitting(false);
                }
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to update profile");
            setIsSubmitting(false);
        }
    };

    const performUpdate = async (updateData: any) => {
        if (!user?.id) {
            setErrorMessage("User not found");
            return;
        }

        try {
            const updatedUser = await apiPut(`user/${user.id}`, updateData);
            if (setUser) {
                setUser(updatedUser);
            }
            setSuccessMessage("Profile updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setProfileImage(null);
            setProfileImagePreview(null);
            setTimeout(() => {
                onOpenChange();
            }, 1500);
        } catch (error) {
            throw error;
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <h3 className="text-xl font-semibold text-white">Settings</h3>
                </CardHeader>
                <CardBody>
                    <p className="text-gray-400">
                        Manage your account settings and preferences
                    </p>
                    <Button
                        className="mt-4"
                        color="primary"
                        variant="flat"
                        fullWidth
                        onPress={onOpen}
                    >
                        Account Settings
                    </Button>
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Account Settings
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-6">
                                    {/* Profile Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Profile Photo
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {profileImagePreview ? (
                                                    <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                                                ) : user?.username ? (
                                                    <span className="text-2xl text-white">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className="text-2xl text-white">U</span>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    id="profile-image-input"
                                                />
                                                <label htmlFor="profile-image-input">
                                                    <Button
                                                        as="span"
                                                        size="sm"
                                                        variant="flat"
                                                        className="cursor-pointer"
                                                    >
                                                        Upload Photo
                                                    </Button>
                                                </label>
                                                {profileImage && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {profileImage.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Change Password */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold">Change Password</h4>
                                        <Input
                                            label="Current Password"
                                            type="password"
                                            placeholder="Enter current password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            fullWidth
                                        />
                                        <Input
                                            label="New Password"
                                            type="password"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            fullWidth
                                        />
                                        <Input
                                            label="Confirm New Password"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            fullWidth
                                            errorMessage={confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : undefined}
                                        />
                                    </div>

                                    {errorMessage && (
                                        <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                                            <p className="text-danger-700 dark:text-danger-400 text-sm">
                                                {errorMessage}
                                            </p>
                                        </div>
                                    )}

                                    {successMessage && (
                                        <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                                            <p className="text-success-700 dark:text-success-400 text-sm">
                                                {successMessage}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleSubmit}
                                    isLoading={isSubmitting}
                                >
                                    Save Changes
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
