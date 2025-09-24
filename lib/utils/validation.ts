// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (at least 6 characters, 1 uppercase, 1 lowercase, 1 number)
export const isValidPassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long',
    };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    };
  }
  
  return {
    isValid: true,
    message: '',
  };
};

interface FormErrors {
  [key: string]: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

// Form validation for signup
export const validateSignupForm = (formData: SignupFormData): ValidationResult => {
  const errors: FormErrors = {};
  
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Name is required';
  }
  
  if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = isValidPassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
  }
  
  if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

interface LoginFormData {
  email: string;
  password: string;
}

// Form validation for login
export const validateLoginForm = (formData: LoginFormData): ValidationResult => {
  const errors: FormErrors = {};
  
  if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

interface CourseFormData {
  title: string;
  description: string;
  thumbnail?: string;
}

// Form validation for course creation
export const validateCourseForm = (formData: CourseFormData): ValidationResult => {
  const errors: FormErrors = {};
  
  if (!formData.title || formData.title.trim() === '') {
    errors.title = 'Title is required';
  }
  
  if (!formData.description || formData.description.trim() === '') {
    errors.description = 'Description is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

interface AssessmentFormData {
  title: string;
  description: string;
  type: string;
  dueDate?: string;
}

// Form validation for assessment creation
export const validateAssessmentForm = (formData: AssessmentFormData): ValidationResult => {
  const errors: FormErrors = {};
  
  if (!formData.title || formData.title.trim() === '') {
    errors.title = 'Title is required';
  }
  
  if (!formData.description || formData.description.trim() === '') {
    errors.description = 'Description is required';
  }
  
  if (!formData.type || !['quiz', 'assignment'].includes(formData.type)) {
    errors.type = 'Valid assessment type is required';
  }
  
  if (formData.dueDate) {
    const dueDate = new Date(formData.dueDate);
    const now = new Date();
    
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = 'Invalid date format';
    } else if (dueDate < now) {
      errors.dueDate = 'Due date cannot be in the past';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
