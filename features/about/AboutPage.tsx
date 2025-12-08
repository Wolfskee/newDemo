import { Card, CardBody } from "@nextui-org/react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          About Us
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Learn more about our company and mission
        </p>

        <div className="space-y-8">
          <Card>
            <CardBody className="p-8">
              <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                We are dedicated to providing exceptional products and services that meet
                the highest standards of quality and customer satisfaction. Our mission is
                to build lasting relationships with our clients by delivering innovative
                solutions and outstanding service.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-8">
              <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                Our Values
              </h2>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
                <li className="flex items-start">
                  <span className="mr-3 text-primary text-2xl">✓</span>
                  <span>
                    <strong className="text-gray-900 dark:text-white">Excellence:</strong> We strive for excellence in everything we do
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-primary text-2xl">✓</span>
                  <span>
                    <strong className="text-gray-900 dark:text-white">Integrity:</strong> We conduct business with honesty and transparency
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-primary text-2xl">✓</span>
                  <span>
                    <strong className="text-gray-900 dark:text-white">Innovation:</strong> We embrace new technologies and creative solutions
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-primary text-2xl">✓</span>
                  <span>
                    <strong className="text-gray-900 dark:text-white">Customer Focus:</strong> Our customers are at the heart of everything we do
                  </span>
                </li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-8">
              <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                Our Team
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                Our team consists of experienced professionals who are passionate about
                delivering the best possible experience for our clients. We work together
                to ensure that every project is completed to the highest standards and
                that our customers receive the support they need.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-8">
              <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                Contact Us
              </h2>
              <div className="space-y-3 text-gray-600 dark:text-gray-400 text-lg">
                <p>
                  <strong className="text-gray-900 dark:text-white">Address:</strong> University of Manitoba
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Phone:</strong> +1 (234) 567-8900
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Email:</strong> info@codeanchorteam.com
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
