import React from 'react';
import ImprovementStudyProgressAdmin from './ImprovementStudyProgressAdmin';

interface ImprovementAdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

export default function ImprovementAdmin({ onBack, hideBack = false }: ImprovementAdminProps) {
  return <ImprovementStudyProgressAdmin onBack={onBack} hideBack={hideBack} />;
}
