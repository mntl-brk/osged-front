import React, { useState, useEffect } from 'react';
import { ArrowRight, Delete } from 'lucide-react';
import { WordSet } from '../types';
import { AssessmentProgress } from './AssessmentProgress';

interface AssessmentWordRecallPageProps {
  correctWordSet: WordSet;
  onNext: (score: number, recalledWords: string[]) => void;
}

// Pool of distractor words to mix with correct words
const DISTRACTORS = [
  'แมว', 'ดินสอ', 'โต๊ะ', 'แม่น้ำ', 'หนังสือ', 
  'รองเท้า', 'นาฬิกา', 'ข้าว', 'แก้วน้ำ', 'โทรศัพท์'
];

export const AssessmentWordRecallPage: React.FC<AssessmentWordRecallPageProps> = ({ 
  correctWordSet, 
  onNext 
}) => {
  const [inputs, setInputs] = useState<string[]>(['', '', '']);
  const [choices, setChoices] = useState<string[]>([]);

  // Initialize choices (Correct words + Random Distractors)
  useEffect(() => {
    // 1. Start with correct words
    let pool = [...correctWordSet.words];
    
    // 2. Add 6 random distractors
    const shuffledDistractors = [...DISTRACTORS].sort(() => 0.5 - Math.random());
    pool = pool.concat(shuffledDistractors.slice(0, 6));

    // 3. Shuffle everything
    const shuffledPool = pool.sort(() => 0.5 - Math.random());
    
    setChoices(shuffledPool);
  }, [correctWordSet]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleChoiceClick = (word: string) => {
    // Check if word is already selected (in inputs)
    const existingIndex = inputs.indexOf(word);

    if (existingIndex >= 0) {
      // If already selected, remove it
      const newInputs = [...inputs];
      newInputs[existingIndex] = '';
      setInputs(newInputs);
    } else {
      // If not selected, find first empty slot
      const emptyIndex = inputs.findIndex(val => val.trim() === '');
      if (emptyIndex >= 0) {
        const newInputs = [...inputs];
        newInputs[emptyIndex] = word;
        setInputs(newInputs);
      }
    }
  };

  const calculateScore = () => {
    let score = 0;
    // Normalize correct words
    const targets = correctWordSet.words.map(w => w.trim());
    
    // Check inputs
    inputs.forEach(input => {
      if (targets.includes(input.trim())) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    onNext(score, inputs);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in flex flex-col items-center pb-32">
      
      {/* Progress Bar - Step 3 */}
      <AssessmentProgress currentStep={3} />

      {/* A. Header */}
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-6 text-gray-900 mt-4">
        คุณยังจำคำที่แสดงก่อนหน้านี้ได้หรือไม่?
      </h1>

      {/* B. Instruction */}
      <p className="text-xl md:text-2xl text-gray-600 font-medium text-center mb-10">
        โปรดพิมพ์คำที่จำได้ หรือเลือกจากรายการด้านล่าง
      </p>

      {/* C. Input Fields (Free Recall) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {inputs.map((value, index) => (
          <input
            key={index}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder={`พิมพ์คำที่จำได้ ${index + 1}`}
            className="
              w-full h-16 md:h-20 
              text-2xl md:text-3xl font-medium text-center
              border-2 border-[#C4C4C4] rounded-xl
              focus:border-primary focus:ring-2 focus:ring-primary/20
              outline-none transition-all
              placeholder:text-gray-300
            "
          />
        ))}
      </div>

      {/* C.2 Choice Buttons (Recognition Support) */}
      <div className="w-full mb-12">
        <p className="text-lg text-gray-500 mb-4 text-center">
          (แตะเพื่อเลือกคำตอบ)
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {choices.map((word, idx) => {
            const isSelected = inputs.includes(word);
            return (
              <button
                key={idx}
                onClick={() => handleChoiceClick(word)}
                className={`
                  min-w-[120px] px-6 h-[60px] 
                  rounded-2xl 
                  text-2xl font-medium 
                  border-2 transition-all duration-200
                  flex items-center justify-center
                  shadow-sm
                  ${isSelected 
                    ? 'bg-primary text-white border-primary shadow-inner scale-95' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-gray-50 hover:-translate-y-1 hover:shadow-md'}
                `}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {/* D. Next Button */}
      <button 
        onClick={handleSubmit}
        className="
          w-full max-w-sm
          bg-primary hover:bg-primaryHover text-white 
          h-16 md:h-20
          rounded-2xl 
          text-2xl md:text-3xl font-bold 
          shadow-lg hover:shadow-xl hover:-translate-y-1
          transform transition-all duration-200
          flex items-center justify-center gap-4
        "
      >
        <span>ถัดไป</span>
        <ArrowRight size={36} strokeWidth={3} />
      </button>

    </div>
  );
};