import React, {
  useState,
  ChangeEvent,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import image1 from "../../public/01.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { serverURL } from "@/lib/serverConfig";
import { UUID } from "crypto";

interface UsersList {
  user_id: UUID;
  user_name: string;
}

interface ChatList {
  user_id: UUID;
  chat_id: UUID;
  user_name: string;
  owner_id: UUID;
  owner_name: string;
}

interface Props {
  setName: Dispatch<SetStateAction<string>>;
  setId: Dispatch<SetStateAction<string>>;
  setChatId: Dispatch<SetStateAction<string>>;
}

function SearchAndList({ setName, setId, setChatId }: Props) {
  const [usersList, setUsersList] = useState<UsersList[]>([]);
  const [chatList, setChatList] = useState<ChatList[]>([]);
  const [ownerList, setOwnerList] = useState<ChatList[]>([]);
  const [updateFlag, setUpdateFlag] = useState(false);

  const [userId, setUserId] = useState<string>("");
  const [userExists, setUserExists] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UsersList | null>(null);

  useEffect(() => {
    axios
      .get(`${serverURL}/chats`, {
        headers: {
          Authentication: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setUsersList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get(`${serverURL}/chats/chatListUsers`, {
        headers: {
          Authentication: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setOwnerList(response.data.ownerChats);
        setChatList(response.data.userChats);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [updateFlag]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const id = event.target.value.slice(-5);
    setUserId(id);
    const user = usersList.find((user) => user.user_id.slice(-5) === id);
    setUserExists(!!user);
    setSelectedUser(user || null);
  };

  const handleButtonClick = () => {
    if (selectedUser) {
      axios
        .post(
          `${serverURL}/chats/addChatList/${localStorage.getItem("user_name")}`,
          { user_name: selectedUser.user_name, user_id: selectedUser.user_id },
          {
            headers: {
              Authentication: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          console.log(response);
          setUpdateFlag((prev) => !prev);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const userSelected = (name: string, id: string, chat_id: string) => {
    setName(name);
    setId(id);
    setChatId(chat_id);

    axios
      .post(
        `${serverURL}/chats`,
        { name, chat_id, user_id: id },
        {
          headers: {
            Authentication: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <div>
        <Input
          type="text"
          placeholder="Enter User Id"
          value={userId}
          onChange={handleInputChange}
        />
        {userExists && selectedUser && (
          <Card className="w-[87%] absolute z-10">
            <CardContent className="p-0">
              <div
                className="flex gap-2 items-center h-[6vh] w-[100%] cursor-pointer hover:bg-zinc-800 rounded-md py-2 px-2"
                onClick={handleButtonClick}
              >
                <div className="flex items-center ml-2 gap-2">
                  <h1 className="text-sm">{selectedUser.user_name}</h1>
                  <p className="text-xs text-zinc-400">
                    #{selectedUser.user_id.slice(-5)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <ScrollArea className="h-[20vh] border rounded-md p-3">
        <div className="flex flex-wrap gap-3">
          {[...chatList, ...ownerList].map((user) => {
            const name = user.user_name || user.owner_name;
            const id = user.user_id || user.owner_id;

            return (
              <div
                key={id}
                className="flex gap-2 items-center justify-center h-[6vh] max-w-[70%] w-fit cursor-pointer hover:bg-zinc-800 rounded-md py-7 px-2"
                onClick={() => userSelected(name, id, user.chat_id)}
              >
                <Image
                  src={image1}
                  alt="image1"
                  width={40}
                  height={40}
                  className="rounded-full h-[40px]"
                />
                <div className="flex flex-col">
                  <h1 className="text-sm">{name}</h1>
                  <p className="text-xs text-zinc-400">#{id.slice(-5)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}

export default SearchAndList;
