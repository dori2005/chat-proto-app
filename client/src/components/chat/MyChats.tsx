import { getSender } from "@/common/chatLogics";
import { ChatState } from "@/context/chatProvider";
import { ChatStateType } from "@/models/context/ChatStateType";
import UserModel from "@/models/userModel";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import GroupChatModal from "@components/modal/GroupChatModal";
import axios from "axios";
import { useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";

export default function MyChats({fetchAgain} : {fetchAgain: boolean}) {
  const [loggedUser, setLoggedUser] = useState<UserModel | null>(null);
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState() as ChatStateType;
  const toast = useToast();
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  
  useEffect(() => {
    const userInfoString = localStorage.getItem("userInfo");
    if (userInfoString) {
      setLoggedUser(JSON.parse(userInfoString));
      fetchChats();
    } else {
      toast({
        title: "로그인 토큰 만료",
        description: "나의 채팅 목록 조회  실패",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      })
    }
  }, [fetchAgain])

  return (
    <Box
      display={selectedChat ? "" : "flex"}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w="40%"
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        나의 채팅 목록
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
          새로운 그륩 채팅방 생성
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser!, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.nickname} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  )
}
