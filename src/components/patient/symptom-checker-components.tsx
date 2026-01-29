'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Phone, 
  Video, 
  Star, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Pill,
  Calendar,
  ShoppingCart,
  HeartPulse,
  User,
  Languages
} from 'lucide-react';
import { Doctor, OTCMedicine } from '@/lib/doctor-database';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Severity Indicator Component
interface SeverityIndicatorProps {
  severity: 'Mild' | 'Moderate' | 'Severe';
}

export function SeverityIndicator({ severity }: SeverityIndicatorProps) {
  const getSeverityConfig = () => {
    switch (severity) {
      case 'Mild':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          progress: 33,
          icon: CheckCircle,
          label: 'Mild - Self-care recommended'
        };
      case 'Moderate':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          progress: 66,
          icon: AlertTriangle,
          label: 'Moderate - Consider consulting a doctor'
        };
      case 'Severe':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          progress: 100,
          icon: AlertTriangle,
          label: 'Severe - Immediate medical attention required'
        };
    }
  };

  const config = getSeverityConfig();
  const IconComponent = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 ${config.textColor}`} />
            <span className={`font-semibold ${config.textColor}`}>
              Severity Level: {severity}
            </span>
          </div>
        </div>
        <Progress value={config.progress} className="h-2 mb-2" />
        <p className={`text-sm ${config.textColor}`}>{config.label}</p>
      </CardContent>
    </Card>
  );
}

// Suggested Doctor Card Component
interface SuggestedDoctorCardProps {
  doctor: Doctor;
  onCallNow: () => void;
}

export function SuggestedDoctorCard({ doctor, onCallNow }: SuggestedDoctorCardProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Recommended Doctor
          </span>
          <Badge className={getAvailabilityColor(doctor.availability)}>
            {doctor.availability}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{doctor.name}</h3>
            <p className="text-muted-foreground">{doctor.specialization}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{doctor.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{doctor.experience}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{doctor.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Languages: </span>
            <span>{doctor.languages.join(', ')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Consultation Fee: </span>
            <span className="font-semibold">₹{doctor.consultationFee}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={onCallNow}
            className="flex-1"
            disabled={doctor.availability === 'Offline'}
          >
            <Video className="w-4 h-4 mr-2" />
            Call Now
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open(`tel:${doctor.phone}`)}
            disabled={doctor.availability === 'Offline'}
          >
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// OTC Medicines Component
interface OTCMedicinesProps {
  medicines: OTCMedicine[];
}

export function OTCMedicines({ medicines }: OTCMedicinesProps) {
  if (medicines.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Pill className="w-5 h-5" />
          Over-the-Counter Medicine Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {medicines.map((medicine, index) => (
          <div key={index} className="p-3 bg-white rounded-lg border border-orange-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-orange-900">{medicine.name}</h4>
            </div>
            <p className="text-sm text-orange-800 mb-2">{medicine.purpose}</p>
            <div className="space-y-1 text-xs text-orange-700">
              <p><strong>Dosage:</strong> {medicine.dosage}</p>
              <p><strong>Precautions:</strong> {medicine.precautions}</p>
            </div>
          </div>
        ))}
        
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold">Important Disclaimer:</p>
              <p>Consult a doctor before taking any medication. This is not a medical prescription. 
              These suggestions are for informational purposes only.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Next Steps Component
interface NextStepsProps {
  severity: 'Mild' | 'Moderate' | 'Severe';
  hasDoctor: boolean;
  hasMedicines: boolean;
  onBookConsultation: () => void;
  onOrderMedicines: () => void;
  onViewHealthAdvice: () => void;
}

export function NextSteps({ 
  severity, 
  hasDoctor, 
  hasMedicines, 
  onBookConsultation, 
  onOrderMedicines, 
  onViewHealthAdvice 
}: NextStepsProps) {
  const getStepsForSeverity = () => {
    switch (severity) {
      case 'Severe':
        return [
          { 
            text: 'Book immediate doctor consultation', 
            action: onBookConsultation, 
            priority: 'high',
            icon: Calendar,
            color: 'bg-red-50 border-red-200 text-red-800'
          }
        ];
      case 'Moderate':
        return [
          { 
            text: 'Book doctor consultation', 
            action: onBookConsultation, 
            priority: 'medium',
            icon: Calendar,
            color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
          },
          ...(hasMedicines ? [{ 
            text: 'Order suggested medicines', 
            action: onOrderMedicines, 
            priority: 'low',
            icon: ShoppingCart,
            color: 'bg-blue-50 border-blue-200 text-blue-800'
          }] : [])
        ];
      case 'Mild':
        return [
          ...(hasMedicines ? [{ 
            text: 'Order suggested medicines', 
            action: onOrderMedicines, 
            priority: 'medium',
            icon: ShoppingCart,
            color: 'bg-blue-50 border-blue-200 text-blue-800'
          }] : []),
          { 
            text: 'Follow health advice', 
            action: onViewHealthAdvice, 
            priority: 'low',
            icon: HeartPulse,
            color: 'bg-green-50 border-green-200 text-green-800'
          }
        ];
    }
  };

  const steps = getStepsForSeverity();

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <CheckCircle className="w-5 h-5" />
          Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          Based on your symptoms, here are the recommended actions:
        </p>
        
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div key={index} className={`p-3 rounded-lg border ${step.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{step.text}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={step.action}
                  className="text-xs"
                >
                  {step.priority === 'high' ? 'Book Now' : 
                   step.priority === 'medium' ? 'Proceed' : 'View'}
                </Button>
              </div>
            </div>
          );
        })}
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Remember:</strong> This is not a medical diagnosis. Always consult with a qualified healthcare professional for proper medical advice and treatment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}











