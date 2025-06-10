
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/Auth/RegisterForm';
import { Button } from '@/components/ui/button';

const Register = () => {
  const navigate = useNavigate();
  
  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-brand-blue">Shoply</h1>
          </Link>
          <p className="mt-2 text-muted-foreground">
            Create your account to get started
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <RegisterForm onSuccess={handleRegisterSuccess} />
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or sign up with</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="outline">
                <svg className="mr-2 h-4 w-4" width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" fill="#4285F4"></path>
                </svg>
                Google
              </Button>
              <Button variant="outline">
                <svg className="mr-2 h-4 w-4" width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.665 16.811a10.316 10.316 0 0 1-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.562-.373-.61-.249-1.17-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.019-1.152-.242-1.725-.788-.367-.32-.826-.87-1.377-1.648-.59-.829-1.075-1.794-1.455-2.891-.407-1.187-.611-2.335-.611-3.447 0-1.273.275-2.372.826-3.292a4.857 4.857 0 0 1 1.73-1.751 4.65 4.65 0 0 1 2.34-.662c.46 0 1.063.142 1.81.422s1.227.422 1.436.422c.158 0 .689-.167 1.593-.498.853-.307 1.573-.434 2.163-.384 1.6.129 2.801.759 3.6 1.895-1.43.867-2.137 2.08-2.123 3.637.012 1.213.453 2.222 1.317 3.023.39.36.83.64 1.323.838-.106.302-.22.591-.342.866z" fill="#000000"></path>
                </svg>
                Apple
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Register;
