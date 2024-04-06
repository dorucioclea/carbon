import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  VStack,
} from "@carbon/react";
import { Form } from "@remix-run/react";
import { useParams } from "@remix-run/react";
import { path } from "~/utils/path";
import type { Quotation } from "../../types";

type ConvertToSalesOrderModalProps = {
  onClose: () => void;
  quotation?: Quotation;
};

const ConvertToSalesOrderModal = ({
  quotation,
  onClose,
}: ConvertToSalesOrderModalProps) => {
  const { id } = useParams();
  if (!id) throw new Error("id not found");

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <ModalContent>
        <Form
          method="post"
          action={path.to.convertQuoteToOrder(id)}
          onSubmit={onClose}
        >
          <ModalHeader>
            <ModalTitle>{`Convert to Sales Order - ${quotation?.quoteId}`}</ModalTitle>
            <ModalDescription>
              Are you sure you want to convert this quote to a sales order?
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Convert to sales order</Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default ConvertToSalesOrderModal;
