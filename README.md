# AI Career Coach 🎯📄

An AI-powered career guidance platform that helps users either analyze their resume or start fresh with personalized career roadmaps. Built with modern web technologies and integrated with LLM APIs for smart suggestions and analysis.

---

## 🚀 Features

### **DOCX Resume Upload**
- Accepts `.docx` files for analysis
- Uses external API + LLM to extract and understand content
- Generates comprehensive insights including:
  - **ATS Score** (0–100) - Applicant Tracking System compatibility
  - **Radar Chart** with multi-dimensional analysis:
    - Relevance to target roles
    - Depth of experience
    - Soft Skills demonstration
    - Language proficiency
    - Credentials & certifications
  - **Pie Chart** showing top skills distribution
  - **Personalized Suggestions** for:
    - Skills to learn next
    - Relevant job opportunities
    - Useful certifications to pursue
    - Project ideas to build portfolio

### **Start Fresh Mode**
- Designed for students or career switchers
- Interactive questionnaire for interests and strengths
- AI-powered role recommendations
- Auto-generates a task-based roadmap (Trello-style board)
- Each task follows a structured progression:
  - **Explore** → Research the field
  - **Learn** → Acquire necessary skills
  - **Build** → Create portfolio projects
  - **Apply** → Job search and networking

### **Interactive Dashboard**
- Clean, intuitive interface for resume analysis results
- Dynamic visual charts and metrics
- Personalized next steps and action items
- Smooth animations and accessible design
- Mobile-responsive layout

---

## 🛠 Tech Stack

### **Frontend**
- **Next.js** (App Router) - React framework with server-side rendering
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework

### **Forms & Validation**
- **React Hook Form** - Performant form library
- **Zod** - TypeScript-first schema validation

### **UI Components**
- **RadixUI** - Modern component library
- **Lucide Icons** - Beautiful icon set
- **Recharts** - Composable charting library (Radar, Pie charts)

### **State Management**
- **React Context** - Global state management
- **Session Storage** - Client-side data persistence

### **File Processing**
- **mammoth** - Extract text from `.docx` files
- **File API** - Handle file uploads

### **AI Integration**
- **Groq LLaMA 4 Scout** - Large language model via OpenAI-compatible endpoint
- **Custom prompting** - Tailored prompts for resume analysis and career guidance

---

## 🔧 Getting Started

### **Prerequisites**
- Node.js 18+ installed
- npm package manager 
- 3 Groq API keys for AI functionality
- Rapid API key for AI functionality

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-career-coach.git
   cd ai-career-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
   GROQ_API_KEY_TASKS=YOUR_ANOTHER_GROQ_API_KEY
   GROQ_API_KEY_ANALYZE=YOUR_ANOTHER_GROQ_API_KEY
   RAPIDAPI_KEY=YOUR_RAPIDAPI_KEY_HERE
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

### **Build for Production**
```bash
npm run build
npm start
```

---

## 🤖 How AI is Used

### **Resume Analysis Prompt**
The AI analyzes uploaded resumes using a structured prompt that returns JSON with:
- **ATS Score calculation** based on keyword matching and formatting
- **Skills extraction** with proficiency levels
- **Radar metrics** for multi-dimensional evaluation
- **Pie chart data** for skill distribution visualization
- **Actionable suggestions** for improvement

### **Start Fresh Prompt**
For career exploration, the AI:
- **Suggests relevant roles** based on user interests and strengths
- **Generates personalized roadmaps** with specific, actionable tasks
- **Creates learning paths** tailored to beginner skill levels
- **Provides industry insights** and growth opportunities

### **Example AI Integration**
```typescript
const analyzeResume = async (resumeText: string) => {
  const response = await fetch('/api/resume-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText })
  });
  
  return response.json();
};
```

---

## 📊 Key Features in Detail

### **ATS Score Analysis**
- Keyword density analysis
- Formatting compliance check
- Section completeness evaluation
- Industry-specific optimization tips

### **Visual Analytics**
- **Radar Chart**: Multi-dimensional skill assessment
- **Pie Chart**: Skill distribution and gaps
- **Progress Tracking**: Career development metrics

### **Personalized Roadmaps**
- **Task-based learning**: Structured progression paths
- **Industry-specific guidance**: Tailored to target roles
- **Timeline management**: Realistic milestone setting
- **Resource recommendations**: Curated learning materials

---

## 🎨 Design Philosophy

- **User-centric**: Intuitive interface designed for job seekers
- **Accessibility-first**: WCAG compliant design patterns
- **Mobile-responsive**: Seamless experience across devices
- **Performance-optimized**: Fast loading and smooth interactions

---

## 🔮 Future Enhancements

- [ ] PDF resume support
- [ ] LinkedIn profile integration
- [ ] Cover letter generation
- [ ] Interview preparation tools
- [ ] Job market trend analysis
- [ ] Salary benchmarking
- [ ] Networking recommendations
- [ ] Progress tracking dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Groq** for providing fast LLM inference
- **RadixUI** for beautiful UI components
- **Recharts** for excellent charting capabilities
- **Next.js team** for the amazing framework

---

## 👨‍💻 Author

**Your Name**
- GitHub: https://github.com/SagarSharma5
- LinkedIn: https://www.linkedin.com/in/sagar-sharma-2964251a0/
- Email: sagar.sharma.5235@gmail.com

---

## 📞 Support

If you have any questions or need help with the project:
- Open an issue on GitHub
- Check the [documentation](https://github.com/yourusername/ai-career-coach/wiki)
- Join our [Discord community](https://discord.gg/your-server)

---

*Made with ❤️ by Sagar Sharma*
