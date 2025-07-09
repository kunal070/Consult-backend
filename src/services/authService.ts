import bcrypt from 'bcrypt';
import { getConnection } from '../config/database';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterClientInput {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  companyWebsite?: string;
  industry: string;
  companySize: string;
  location: string;
  role: string;
  useCase: string;
  phoneNumber?: string;
  hearAboutUs?: string;
  acceptTerms: boolean;
}

interface RegisterConsultantInput {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  location: string;
  preferredWorkType: string;
  preferredWorkMode: string;
  specialization: string;
  yearsOfExperience: number;
  primarySkills: string;
  availableServices: string;
  preferredWorkingHours: string;
  consultingMode: string;
  pricingStructure: string;
  paymentPreferences: string;
  briefBio: string;
  languagesSpoken: string[];
  education: Array<{ Degree: string; Institution: string; Year: string }>;
  professionalExperience: Array<{ Role: string; Company: string; Years: string }>;
  certificates: Array<{ Name: string }>;
}

// ---------------------
// Client Login Service
// ---------------------
export const loginClient = async (data: LoginInput) => {
  const { email, password } = data;
  const pool = await getConnection();

  const result = await pool
    .request()
    .input('email', email)
    .query('SELECT * FROM Clients WHERE Email = @email');

  if (result.recordset.length === 0) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  const user = result.recordset[0];
  const isMatch = await bcrypt.compare(password, user.Password);

  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  return {
    message: 'Login successful',
    user: {
      id: user.Id,
      email: user.Email,
      name: user.Name,
    },
  };
};

// -------------------------
// Consultant Login Service
// -------------------------
export const loginConsultant = async (data: LoginInput) => {
  const { email, password } = data;
  const pool = await getConnection();

  const result = await pool
    .request()
    .input('Email', email.toLowerCase())
    .query('SELECT ConsultantID, FullName, Email, Password FROM Consultants WHERE Email = @Email');

  if (result.recordset.length === 0) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  const consultant = result.recordset[0];
  const isMatch = await bcrypt.compare(password, consultant.Password);

  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  return {
    message: 'Consultant login successful',
    user: {
      id: consultant.ConsultantID,
      name: consultant.FullName,
      email: consultant.Email,
    },
  };
};

// ------------------------
// Client Register Service
// ------------------------
export const registerClient = async (data: RegisterClientInput) => {
  const pool = await getConnection();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  await pool
    .request()
    .input('FullName', data.fullName)
    .input('Email', data.email)
    .input('Password', hashedPassword)
    .input('CompanyName', data.companyName)
    .input('CompanyWebsite', data.companyWebsite || null)
    .input('Industry', data.industry)
    .input('CompanySize', data.companySize)
    .input('Location', data.location)
    .input('Role', data.role)
    .input('UseCase', data.useCase)
    .input('PhoneNumber', data.phoneNumber || null)
    .input('HearAboutUs', data.hearAboutUs || null)
    .input('AcceptTerms', data.acceptTerms ? 1 : 0)
    .query(`
      INSERT INTO Clients (
        FullName, Email, Password, CompanyName, CompanyWebsite,
        Industry, CompanySize, Location, Role, UseCase,
        PhoneNumber, HearAboutUs, AcceptTerms
      ) VALUES (
        @FullName, @Email, @Password, @CompanyName, @CompanyWebsite,
        @Industry, @CompanySize, @Location, @Role, @UseCase,
        @PhoneNumber, @HearAboutUs, @AcceptTerms
      );
    `);

  return { message: 'Client registered successfully' };
};

// -----------------------------
// Consultant Register Service
// -----------------------------
export const registerConsultant = async (data: RegisterConsultantInput) => {
  const pool = await getConnection();

  const existing = await pool
    .request()
    .input('Email', data.email.toLowerCase())
    .query('SELECT 1 FROM Consultants WHERE Email = @Email');

  if (existing.recordset.length > 0) {
    throw { statusCode: 409, message: 'Consultant with this email already exists.' };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const result = await pool
    .request()
    .input('FullName', data.fullName)
    .input('Email', data.email.toLowerCase())
    .input('PhoneNumber', data.phoneNumber)
    .input('Location', data.location)
    .input('PreferredWorkType', data.preferredWorkType)
    .input('PreferredWorkMode', data.preferredWorkMode)
    .input('Specialization', data.specialization)
    .input('YearsOfExperience', data.yearsOfExperience)
    .input('PrimarySkills', data.primarySkills)
    .input('AvailableServices', data.availableServices)
    .input('PreferredWorkingHours', data.preferredWorkingHours)
    .input('ConsultingMode', data.consultingMode)
    .input('PricingStructure', data.pricingStructure)
    .input('PaymentPreferences', data.paymentPreferences)
    .input('BriefBio', data.briefBio)
    .input('Password', hashedPassword)
    .query(`
      INSERT INTO Consultants (
        FullName, Email, PhoneNumber, Location, PreferredWorkType, PreferredWorkMode,
        Specialization, YearsOfExperience, PrimarySkills, AvailableServices,
        PreferredWorkingHours, ConsultingMode, PricingStructure, PaymentPreferences,
        BriefBio, Password
      )
      OUTPUT INSERTED.ConsultantID
      VALUES (
        @FullName, @Email, @PhoneNumber, @Location, @PreferredWorkType, @PreferredWorkMode,
        @Specialization, @YearsOfExperience, @PrimarySkills, @AvailableServices,
        @PreferredWorkingHours, @ConsultingMode, @PricingStructure, @PaymentPreferences,
        @BriefBio, @Password
      );
    `);

  const consultantId = result.recordset[0].ConsultantID;

  const insertArray = async (
    array: any[],
    tableName: string,
    columns: string[]
  ) => {
    for (const item of array) {
      const request = pool.request().input('ConsultantID', consultantId);
      columns.forEach((col) => request.input(col, item[col]));
      await request.query(`
        INSERT INTO ${tableName} (ConsultantID, ${columns.join(', ')})
        VALUES (@ConsultantID, ${columns.map((col) => `@${col}`).join(', ')});
      `);
    }
  };

  await insertArray(
    data.languagesSpoken.map((lang) => ({ Language: lang })),
    'LanguagesSpoken',
    ['Language']
  );
  await insertArray(data.education, 'Education', ['Degree', 'Institution', 'Year']);
  await insertArray(data.professionalExperience, 'ProfessionalExperience', ['Role', 'Company', 'Years']);
  await insertArray(data.certificates, 'Certificates', ['Name']);

  return { message: 'Consultant registered successfully!' };
};
