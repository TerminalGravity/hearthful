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
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { Stepper } from "../ui/stepper";
import { Info, CreditCard, Zap, Calendar, Bot } from "lucide-react";
import { Plus } from "lucide-react";
import { CuisineSelector } from "../ui/cuisine-selector";
import { DietarySelector } from "../ui/dietary-selector";
import { GameSelector } from "../ui/game-selector";
import { DrinkSelector } from "../ui/drink-selector";
import { cn } from "@/lib/utils";

type FamilyMember = {
  email: string;
  role: "admin" | "member";
  name?: string;
  dietaryRestrictions?: string[];
  gamePreferences?: string[];
  cuisinePreferences?: string[];
  drinkPreferences?: string[];
  additionalNotes?: string;
};

type Step = {
  id: string;
  title: string;
  description: string;
};

const steps: readonly Step[] = [
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

const selectedButtonClass = "border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20";
const unselectedButtonClass = "border border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-700";

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
    members: [] as FamilyMember[],
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
              dietaryRestrictions: [],
              gamePreferences: [],
              cuisinePreferences: [],
              drinkPreferences: [],
            },
            ...progress.members.map(member => ({
              ...member,
              dietaryRestrictions: member.dietaryRestrictions || [],
              gamePreferences: member.gamePreferences || [],
              cuisinePreferences: member.cuisinePreferences || [],
              drinkPreferences: member.drinkPreferences || [],
            })),
          ],
          preferences: {
            eventFrequency: progress.preferences.eventFrequency,
            aiFeatures: progress.preferences.aiFeatures,
            billing: progress.preferences.billing,
            dietaryRestrictions: progress.preferences.dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean),
            gamePreferences: progress.preferences.gamePreferences.split(',').map(s => s.trim()).filter(Boolean),
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

            {/* Members Table */}
            {progress.members.length > 0 && (
              <Card>
                <CardBody>
                  <Table aria-label="Family members">
                    <TableHeader>
                      <TableColumn>NAME</TableColumn>
                      <TableColumn>EMAIL</TableColumn>
                      <TableColumn>PREFERENCES</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {progress.members.map((member, index) => (
                        <TableRow key={index}>
                          <TableCell>{member.name || "Not specified"}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              {member.cuisinePreferences && member.cuisinePreferences.length > 0 && (
                                <p>🍽️ {member.cuisinePreferences.join(", ")}</p>
                              )}
                              {member.dietaryRestrictions && member.dietaryRestrictions.length > 0 && (
                                <p>🥗 {member.dietaryRestrictions.join(", ")}</p>
                              )}
                              {member.drinkPreferences && member.drinkPreferences.length > 0 && (
                                <p>🥤 {member.drinkPreferences.join(", ")}</p>
                              )}
                              {member.gamePreferences && member.gamePreferences.length > 0 && (
                                <p>🎮 {member.gamePreferences.join(", ")}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              color="danger"
                              variant="light"
                              size="sm"
                              onClick={() => {
                                const newMembers = progress.members.filter((_, i) => i !== index);
                                setProgress(prev => ({ ...prev, members: newMembers }));
                              }}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            )}

            {/* Add Member Form */}
            <Card>
              <CardBody className="space-y-6">
                <h3 className="text-lg font-semibold">Add New Member</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    placeholder="Enter member's name"
                    value={progress.members[progress.members.length - 1]?.name || ""}
                    onChange={(e) => {
                      const newMembers = [...progress.members];
                      const lastIndex = newMembers.length - 1;
                      if (lastIndex >= 0) {
                        newMembers[lastIndex] = { ...newMembers[lastIndex], name: e.target.value };
                        setProgress(prev => ({ ...prev, members: newMembers }));
                      }
                    }}
                  />
                  <Input
                    label="Email"
                    placeholder="Enter member's email"
                    value={progress.members[progress.members.length - 1]?.email || ""}
                    onChange={(e) => {
                      const newMembers = [...progress.members];
                      const lastIndex = newMembers.length - 1;
                      if (lastIndex >= 0) {
                        newMembers[lastIndex] = { ...newMembers[lastIndex], email: e.target.value };
                        setProgress(prev => ({ ...prev, members: newMembers }));
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Cuisine Preferences
                      </label>
                      <CuisineSelector
                        selectedCuisines={progress.members[progress.members.length - 1]?.cuisinePreferences || []}
                        onChange={(cuisines) => {
                          const newMembers = [...progress.members];
                          const lastIndex = newMembers.length - 1;
                          if (lastIndex >= 0) {
                            newMembers[lastIndex] = { ...newMembers[lastIndex], cuisinePreferences: cuisines };
                            setProgress(prev => ({ ...prev, members: newMembers }));
                          }
                        }}
                        title=""
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Dietary Restrictions
                      </label>
                      <DietarySelector
                        selectedDiets={progress.members[progress.members.length - 1]?.dietaryRestrictions || []}
                        onChange={(diets) => {
                          const newMembers = [...progress.members];
                          const lastIndex = newMembers.length - 1;
                          if (lastIndex >= 0) {
                            newMembers[lastIndex] = { ...newMembers[lastIndex], dietaryRestrictions: diets };
                            setProgress(prev => ({ ...prev, members: newMembers }));
                          }
                        }}
                        title=""
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Drink Preferences
                      </label>
                      <DrinkSelector
                        selectedDrinks={progress.members[progress.members.length - 1]?.drinkPreferences || []}
                        onChange={(drinks) => {
                          const newMembers = [...progress.members];
                          const lastIndex = newMembers.length - 1;
                          if (lastIndex >= 0) {
                            newMembers[lastIndex] = { ...newMembers[lastIndex], drinkPreferences: drinks };
                            setProgress(prev => ({ ...prev, members: newMembers }));
                          }
                        }}
                        title=""
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Game Preferences
                      </label>
                      <GameSelector
                        selectedGames={progress.members[progress.members.length - 1]?.gamePreferences || []}
                        onChange={(games) => {
                          const newMembers = [...progress.members];
                          const lastIndex = newMembers.length - 1;
                          if (lastIndex >= 0) {
                            newMembers[lastIndex] = { ...newMembers[lastIndex], gamePreferences: games };
                            setProgress(prev => ({ ...prev, members: newMembers }));
                          }
                        }}
                        title=""
                      />
                    </div>
                  </div>
                </div>

                <Textarea
                  label="Additional Notes"
                  placeholder="Any additional information about the member..."
                  value={progress.members[progress.members.length - 1]?.additionalNotes || ""}
                  onChange={(e) => {
                    const newMembers = [...progress.members];
                    const lastIndex = newMembers.length - 1;
                    if (lastIndex >= 0) {
                      newMembers[lastIndex] = { ...newMembers[lastIndex], additionalNotes: e.target.value };
                      setProgress(prev => ({ ...prev, members: newMembers }));
                    }
                  }}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    color="primary"
                    onClick={() => {
                      const lastMember = progress.members[progress.members.length - 1];
                      if (lastMember?.email && lastMember?.name) {
                        setProgress(prev => ({
                          ...prev,
                          members: [...prev.members, { email: "", role: "member" }]
                        }));
                      }
                    }}
                    startContent={<Plus className="w-4 h-4" />}
                  >
                    Add Another Member
                  </Button>
                </div>
              </CardBody>
            </Card>
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