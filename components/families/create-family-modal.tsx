"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  RadioGroup,
  Radio,
  Card,
  CardBody,
} from "@nextui-org/react";
import { Stepper } from "../ui/stepper";
import { Info, CreditCard, Zap, Calendar, Bot } from "lucide-react";
import { Plus } from "lucide-react";

const steps = [
  {
    id: "family-info",
    title: "Family Information",
    description: "Create your family group and add basic details",
  },
  {
    id: "members",
    title: "Add Members",
    description: "Invite family members to join your group",
  },
  {
    id: "preferences",
    title: "Family Settings",
    description: "Configure events, AI features, and billing",
  },
] as const;

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFamilyModal({ isOpen, onClose }: CreateFamilyModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState({
    familyInfo: {
      name: "",
      description: ""
    },
    members: [] as {
      email: string;
      role: "admin" | "member";
      name?: string;
      dietaryRestrictions?: string;
      gamePreferences?: string;
      additionalNotes?: string;
    }[],
    preferences: {
      eventFrequency: {
        meals: "weekly",
        games: "monthly"
      },
      aiFeatures: {
        mealPlanning: true,
        gameRecommendations: true,
        eventScheduling: true
      },
      billing: {
        plan: "free",
        autoRenew: true
      },
      dietaryRestrictions: "",
      gamePreferences: "",
      additionalNotes: ""
    }
  });

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: progress.familyInfo.name,
          description: progress.familyInfo.description,
          members: [
            {
              userId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName || user.username,
              role: "admin",
            },
            ...progress.members,
          ],
          preferences: {
            eventFrequency: progress.preferences.eventFrequency,
            aiFeatures: progress.preferences.aiFeatures,
            billing: progress.preferences.billing,
            dietaryRestrictions: progress.preferences.dietaryRestrictions.split(",").map(s => s.trim()),
            gamePreferences: progress.preferences.gamePreferences.split(",").map(s => s.trim()),
            additionalNotes: progress.preferences.additionalNotes,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create family");
      }

      toast.success("Family created successfully!");
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Failed to create family:", error);
      toast.error("Failed to create family. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Input
              label="Family Name"
              placeholder="Enter your family name"
              value={progress.familyInfo.name}
              onChange={(e) => setProgress(prev => ({
                ...prev,
                familyInfo: { ...prev.familyInfo, name: e.target.value }
              }))}
              isRequired
              size="lg"
            />
            <Textarea
              label="Description"
              placeholder="Add a description for your family group..."
              value={progress.familyInfo.description}
              onChange={(e) => setProgress(prev => ({
                ...prev,
                familyInfo: { ...prev.familyInfo, description: e.target.value }
              }))}
              size="lg"
              minRows={4}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg">
              <Info className="w-5 h-5 text-primary" />
              <p className="text-sm">You will be automatically added as an admin</p>
            </div>
            {progress.members.map((member, index) => (
              <Card key={index} className="w-full">
                <CardBody className="gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      placeholder="Enter member's name"
                      value={member.name}
                      onChange={(e) => {
                        const newMembers = [...progress.members];
                        newMembers[index] = { ...newMembers[index], name: e.target.value };
                        setProgress(prev => ({ ...prev, members: newMembers }));
                      }}
                    />
                    <Input
                      label="Email"
                      placeholder="Enter member's email"
                      value={member.email}
                      onChange={(e) => {
                        const newMembers = [...progress.members];
                        newMembers[index] = { ...newMembers[index], email: e.target.value };
                        setProgress(prev => ({ ...prev, members: newMembers }));
                      }}
                    />
                  </div>
                  <Input
                    label="Dietary Restrictions"
                    placeholder="e.g., Vegetarian, Gluten-free, Nut allergy"
                    value={member.dietaryRestrictions}
                    onChange={(e) => {
                      const newMembers = [...progress.members];
                      newMembers[index] = { ...newMembers[index], dietaryRestrictions: e.target.value };
                      setProgress(prev => ({ ...prev, members: newMembers }));
                    }}
                  />
                  <Input
                    label="Game Preferences"
                    placeholder="e.g., Chess, Monopoly, Cards"
                    value={member.gamePreferences}
                    onChange={(e) => {
                      const newMembers = [...progress.members];
                      newMembers[index] = { ...newMembers[index], gamePreferences: e.target.value };
                      setProgress(prev => ({ ...prev, members: newMembers }));
                    }}
                  />
                  <Textarea
                    label="Additional Notes"
                    placeholder="Any additional information about the member..."
                    value={member.additionalNotes}
                    onChange={(e) => {
                      const newMembers = [...progress.members];
                      newMembers[index] = { ...newMembers[index], additionalNotes: e.target.value };
                      setProgress(prev => ({ ...prev, members: newMembers }));
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      color="danger"
                      variant="light"
                      onClick={() => {
                        const newMembers = progress.members.filter((_, i) => i !== index);
                        setProgress(prev => ({ ...prev, members: newMembers }));
                      }}
                    >
                      Remove Member
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
            <Button
              onClick={() => setProgress(prev => ({
                ...prev,
                members: [...prev.members, { email: "", role: "member" }]
              }))}
              startContent={<Plus className="w-4 h-4" />}
              className="w-full"
              size="lg"
            >
              Add Member
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Event Frequency</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Meal Events"
                  selectedKeys={[progress.preferences.eventFrequency.meals]}
                  onChange={(e) => setProgress(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      eventFrequency: {
                        ...prev.preferences.eventFrequency,
                        meals: e.target.value
                      }
                    }
                  }))}
                >
                  <SelectItem key="daily" value="daily">Daily</SelectItem>
                  <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
                  <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
                </Select>
                <Select
                  label="Game Events"
                  selectedKeys={[progress.preferences.eventFrequency.games]}
                  onChange={(e) => setProgress(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      eventFrequency: {
                        ...prev.preferences.eventFrequency,
                        games: e.target.value
                      }
                    }
                  }))}
                >
                  <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
                  <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
                  <SelectItem key="quarterly" value="quarterly">Quarterly</SelectItem>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Features</h3>
              </div>
              <Card>
                <CardBody className="gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Meal Planning</p>
                      <p className="text-sm text-gray-500">Get AI-powered meal suggestions</p>
                    </div>
                    <Switch
                      isSelected={progress.preferences.aiFeatures.mealPlanning}
                      onValueChange={(value) => setProgress(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          aiFeatures: {
                            ...prev.preferences.aiFeatures,
                            mealPlanning: value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Game Recommendations</p>
                      <p className="text-sm text-gray-500">Personalized game suggestions</p>
                    </div>
                    <Switch
                      isSelected={progress.preferences.aiFeatures.gameRecommendations}
                      onValueChange={(value) => setProgress(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          aiFeatures: {
                            ...prev.preferences.aiFeatures,
                            gameRecommendations: value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Smart Scheduling</p>
                      <p className="text-sm text-gray-500">AI-assisted event planning</p>
                    </div>
                    <Switch
                      isSelected={progress.preferences.aiFeatures.eventScheduling}
                      onValueChange={(value) => setProgress(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          aiFeatures: {
                            ...prev.preferences.aiFeatures,
                            eventScheduling: value
                          }
                        }
                      }))}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Billing Plan</h3>
              </div>
              <Card>
                <CardBody>
                  <RadioGroup
                    value={progress.preferences.billing.plan}
                    onValueChange={(value) => setProgress(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        billing: {
                          ...prev.preferences.billing,
                          plan: value
                        }
                      }
                    }))}
                  >
                    <Radio value="free">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Free Plan</span>
                        <span className="text-xs text-gray-500">Basic features for small families</span>
                      </div>
                    </Radio>
                    <Radio value="pro">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Pro Plan</span>
                        <span className="text-xs text-gray-500">Advanced features and unlimited events</span>
                      </div>
                    </Radio>
                    <Radio value="enterprise">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Enterprise</span>
                        <span className="text-xs text-gray-500">Custom solutions for large families</span>
                      </div>
                    </Radio>
                  </RadioGroup>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="font-medium">Auto-renew subscription</p>
                      <p className="text-sm text-gray-500">Automatically renew when period ends</p>
                    </div>
                    <Switch
                      isSelected={progress.preferences.billing.autoRenew}
                      onValueChange={(value) => setProgress(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          billing: {
                            ...prev.preferences.billing,
                            autoRenew: value
                          }
                        }
                      }))}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "h-[90vh]",
        body: "py-6",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-xl font-semibold">Create Family Group</h2>
              <p className="text-sm text-gray-500 mt-1">
                {steps[currentStep].description}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {currentStep + 1}/{steps.length} completed
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-4 gap-8">
            <div className="col-span-1 border-r pr-4">
              <Stepper
                steps={steps}
                currentStep={currentStep}
                onStepClick={handleStepClick}
              />
            </div>
            <div className="col-span-3">
              {renderStepContent()}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="light"
              onClick={onClose}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="light"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  color="primary"
                  onClick={handleNext}
                  isDisabled={!progress.familyInfo.name && currentStep === 0}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  color="primary"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                >
                  Create Family
                </Button>
              )}
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function useCreateFamilyModal() {
  const [isOpen, setIsOpen] = useState(false);

  const CreateFamilyModalCallback = () => {
    return (
      <CreateFamilyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    );
  };

  return {
    setShowCreateFamilyModal: setIsOpen,
    CreateFamilyModal: CreateFamilyModalCallback,
  };
} 