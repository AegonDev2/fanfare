
interface ProfileBioProps {
  about: string;
  hobbies: string[];
}

const ProfileBio = ({ about, hobbies }: ProfileBioProps) => {
  return (
    <div>
      <p className="text-gray-600 my-4">{about}</p>
      <div className="mb-4">
        <p className="text-gray-600">Hobbies:</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {hobbies?.map((hobby, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {hobby}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileBio;
